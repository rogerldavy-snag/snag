// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SnagRouterMulti - opt-in charity add-on router with multiple causes
/// @notice Users pick a charity (by id hash or address) when sending.
/// The add-on is 1% (100 bps) by default, paid by the sender ON TOP of
/// the recipient's full intended amount: the recipient gets exactly the
/// amount stated, the cause wallet gets 1% of that amount on top.
/// @dev Add-on model, approved Oct 31 2026. The old split model
/// (recipient got msg.value minus 1%) is preserved in the local tag
/// legacy/split-oct22-refreeze and must not be reintroduced here.
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

    // @dev In the Snagged event, `amount` is the intended recipient
    // amount (what the destination actually receives). It is NOT the
    // total the sender paid; the sender paid amount + snagAmount.
    // This meaning changed with the add-on rewrite (Oct 31 2026);
    // the old split version emitted msg.value as `amount`.
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

    /// @notice Send ETH with a 1% charity add-on on top, paid by the sender.
    /// @param charityIdStr Cause id, e.g. "diapers-baby".
    /// @param destination Who receives the full intended amount.
    /// @param amount The exact amount the destination must receive.
    /// @dev The sender must pay exactly amount + snagAmount, where
    /// snagAmount = amount * feeBps / 10000 (dust rounds down).
    /// A short or over payment reverts, so the recipient never gets
    /// a shortfall and no leftover ETH stays in the contract.
    /// The old split math (take 1% of msg.value, send the rest) is
    /// deliberately NOT used here; do not divide by 1.01 to recover
    /// the amount, that only approximates it.
    function snagAndSend(string calldata charityIdStr, address payable destination, uint256 amount) external payable {
        bytes32 cid = keccak256(bytes(charityIdStr));
        address payable charity = charityWallets[cid];
        require(charity != address(0), "Snag: unknown charity");
        require(amount > 0, "Snag: no amount");
        require(destination != address(0), "Snag: zero destination");
        require(destination != address(this), "Snag: self destination");

        uint256 snagAmount = (amount * feeBps) / BPS_DENOMINATOR;
        require(msg.value == amount + snagAmount, "Snag: wrong value");

        (bool s1, ) = charity.call{value: snagAmount}("");
        require(s1, "Snag: charity failed");
        (bool s2, ) = destination.call{value: amount}("");
        require(s2, "Snag: destination failed");

        emit Snagged(msg.sender, destination, amount, snagAmount, cid, charity);
    }

    /// @notice Recover ETH stuck in this contract (e.g. force sent). Owner only.
    function recoverETH(uint256 amount) external onlyOwner {
        (bool ok, ) = payable(owner).call{value: amount}("");
        require(ok, "Snag: recover failed");
    }
}
