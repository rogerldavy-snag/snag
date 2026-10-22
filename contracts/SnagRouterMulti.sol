// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SnagRouterMulti - opt-in charity fee router with multiple causes
/// @notice Users pick a charity (by id hash or address) when sending.
/// Fee is 1% (100 bps) by default, sent to the chosen charity wallet.
contract SnagRouterMulti {
    address public owner;
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 1000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Two step charity wallet updates: propose, wait the delay, then confirm.
    uint256 public constant CHARITY_UPDATE_DELAY = 1 days;

    // charityId => wallet (charityId is keccak256 of the string id, e.g. "diapers-baby")
    mapping(bytes32 => address payable) public charityWallets;
    bytes32[] public charityIds;

    // charityId => proposed replacement wallet and its activation time
    mapping(bytes32 => address payable) public pendingCharityWallets;
    mapping(bytes32 => uint256) public charityUpdateEtas;

    event Snagged(address indexed from, address indexed destination, uint256 amount, uint256 snagAmount, bytes32 indexed charityId, address charityWallet);
    event CharityAdded(bytes32 indexed charityId, address wallet);
    event CharityWalletUpdated(bytes32 indexed charityId, address oldWallet, address newWallet);
    event CharityUpdateProposed(bytes32 indexed charityId, address oldWallet, address newWallet, uint256 eta);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Snag: not owner");
        _;
    }

    constructor(uint256 _feeBps) {
        require(_feeBps <= MAX_FEE_BPS, "Snag: fee too high");
        owner = msg.sender;
        feeBps = _feeBps;
    }

    /// @notice Hand ownership to a new address, effective immediately.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Snag: zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Give up ownership permanently. All owner functions stop working.
    function renounceOwnership() external onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }

    function addCharity(string calldata charityIdStr, address payable wallet) external onlyOwner {
        require(wallet != address(0), "Snag: zero wallet");
        bytes32 cid = keccak256(bytes(charityIdStr));
        require(charityWallets[cid] == address(0), "Snag: charity exists");
        charityIds.push(cid);
        charityWallets[cid] = wallet;
        emit CharityAdded(cid, wallet);
    }

    /// @notice Step 1 of changing an existing charity's wallet: announce the new wallet.
    /// The change takes effect only after CHARITY_UPDATE_DELAY via confirmCharityWalletUpdate.
    function proposeCharityWalletUpdate(string calldata charityIdStr, address payable wallet) external onlyOwner {
        require(wallet != address(0), "Snag: zero wallet");
        bytes32 cid = keccak256(bytes(charityIdStr));
        require(charityWallets[cid] != address(0), "Snag: unknown charity");
        pendingCharityWallets[cid] = wallet;
        charityUpdateEtas[cid] = block.timestamp + CHARITY_UPDATE_DELAY;
        emit CharityUpdateProposed(cid, charityWallets[cid], wallet, charityUpdateEtas[cid]);
    }

    /// @notice Step 2: activate a proposed wallet update once its delay has passed.
    function confirmCharityWalletUpdate(string calldata charityIdStr) external onlyOwner {
        bytes32 cid = keccak256(bytes(charityIdStr));
        address payable pending = pendingCharityWallets[cid];
        require(pending != address(0), "Snag: no pending update");
        require(block.timestamp >= charityUpdateEtas[cid], "Snag: update not ready");
        address old = charityWallets[cid];
        charityWallets[cid] = pending;
        pendingCharityWallets[cid] = payable(address(0));
        charityUpdateEtas[cid] = 0;
        emit CharityWalletUpdated(cid, old, pending);
    }

    /// @notice Cancel a proposed wallet update before it activates.
    function cancelCharityWalletUpdate(string calldata charityIdStr) external onlyOwner {
        bytes32 cid = keccak256(bytes(charityIdStr));
        pendingCharityWallets[cid] = payable(address(0));
        charityUpdateEtas[cid] = 0;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Snag: fee too high");
        uint256 old = feeBps;
        feeBps = _feeBps;
        emit FeeUpdated(old, _feeBps);
    }

    function snagAndSend(string calldata charityIdStr, address payable destination) external payable {
        bytes32 cid = keccak256(bytes(charityIdStr));
        address payable charity = charityWallets[cid];
        require(charity != address(0), "Snag: unknown charity");
        require(msg.value > 0, "Snag: no value");
        require(destination != address(0), "Snag: zero destination");
        require(destination != address(this), "Snag: self destination");

        uint256 snagAmount = (msg.value * feeBps) / BPS_DENOMINATOR;
        uint256 sendAmount = msg.value - snagAmount;

        (bool s1, ) = charity.call{value: snagAmount}("");
        require(s1, "Snag: charity failed");
        (bool s2, ) = destination.call{value: sendAmount}("");
        require(s2, "Snag: destination failed");

        emit Snagged(msg.sender, destination, msg.value, snagAmount, cid, charity);
    }

    /// @notice Recover ETH stuck in this contract (e.g. force sent). Owner only.
    function recoverETH(uint256 amount) external onlyOwner {
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "Snag: recover failed");
    }
}
