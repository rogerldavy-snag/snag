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

    // charityId => wallet (charityId is keccak256 of the string id, e.g. "diapers-baby")
    mapping(bytes32 => address payable) public charityWallets;
    bytes32[] public charityIds;

    event Snagged(address indexed from, address indexed destination, uint256 amount, uint256 snagAmount, bytes32 indexed charityId, address charityWallet);
    event CharityAdded(bytes32 indexed charityId, address wallet);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);

    modifier onlyOwner() {
        require(msg.sender == owner, "Snag: not owner");
        _;
    }

    constructor(uint256 _feeBps) {
        require(_feeBps <= MAX_FEE_BPS, "Snag: fee too high");
        owner = msg.sender;
        feeBps = _feeBps;
    }

    function addCharity(string calldata charityIdStr, address payable wallet) external onlyOwner {
        require(wallet != address(0), "Snag: zero wallet");
        bytes32 cid = keccak256(bytes(charityIdStr));
        if (charityWallets[cid] == address(0)) {
            charityIds.push(cid);
        }
        charityWallets[cid] = wallet;
        emit CharityAdded(cid, wallet);
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

        uint256 snagAmount = (msg.value * feeBps) / BPS_DENOMINATOR;
        uint256 sendAmount = msg.value - snagAmount;

        (bool s1, ) = charity.call{value: snagAmount}("");
        require(s1, "Snag: charity failed");
        (bool s2, ) = destination.call{value: sendAmount}("");
        require(s2, "Snag: destination failed");

        emit Snagged(msg.sender, destination, msg.value, snagAmount, cid, charity);
    }
}
