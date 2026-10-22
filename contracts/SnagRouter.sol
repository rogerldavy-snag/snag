// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SnagRouter - opt-in charity fee router for ETH + ERC20
/// @notice Users opt in by sending through this contract instead of a direct transfer.
/// A small fee (in basis points) is snagged and sent to a charity wallet.
/// @dev Fee is in basis points: 100 = 1%, 50 = 0.5%. Max 1000 (10%) to prevent accidents.
contract SnagRouter {
    address public owner;
    address payable public charityWallet;
    uint256 public feeBps; // e.g. 100 = 1%

    uint256 public constant MAX_FEE_BPS = 1000;
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Two step charity wallet change: propose, wait the delay, then confirm.
    uint256 public constant CHARITY_CHANGE_DELAY = 1 days;
    address payable public pendingCharityWallet;
    uint256 public charityChangeEta;

    event Snagged(address indexed from, address indexed destination, uint256 amount, uint256 snagAmount, address indexed charity);
    event CharityWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event CharityWalletProposed(address indexed oldWallet, address indexed newWallet, uint256 eta);
    event FeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Snag: not owner");
        _;
    }

    constructor(address payable _charityWallet, uint256 _feeBps) {
        require(_charityWallet != address(0), "Snag: zero charity");
        require(_feeBps <= MAX_FEE_BPS, "Snag: fee too high");
        owner = msg.sender;
        charityWallet = _charityWallet;
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

    /// @notice Step 1 of changing the charity wallet: announce the new wallet.
    /// The change takes effect only after CHARITY_CHANGE_DELAY via confirmCharityWallet.
    function proposeCharityWallet(address payable _charityWallet) external onlyOwner {
        require(_charityWallet != address(0), "Snag: zero charity");
        pendingCharityWallet = _charityWallet;
        charityChangeEta = block.timestamp + CHARITY_CHANGE_DELAY;
        emit CharityWalletProposed(charityWallet, _charityWallet, charityChangeEta);
    }

    /// @notice Step 2: activate a proposed charity wallet once its delay has passed.
    function confirmCharityWallet() external onlyOwner {
        require(pendingCharityWallet != address(0), "Snag: no pending change");
        require(block.timestamp >= charityChangeEta, "Snag: change not ready");
        address old = charityWallet;
        charityWallet = pendingCharityWallet;
        pendingCharityWallet = payable(address(0));
        charityChangeEta = 0;
        emit CharityWalletUpdated(old, charityWallet);
    }

    /// @notice Cancel a proposed charity wallet change before it activates.
    function cancelCharityWalletChange() external onlyOwner {
        pendingCharityWallet = payable(address(0));
        charityChangeEta = 0;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Snag: fee too high");
        uint256 old = feeBps;
        feeBps = _feeBps;
        emit FeeUpdated(old, _feeBps);
    }

    /// @notice Send ETH, snagging a small % for charity.
    /// @param destination Where the main amount goes.
    function snagAndSend(address payable destination) external payable {
        require(msg.value > 0, "Snag: no value");
        require(destination != address(0), "Snag: zero destination");
        require(destination != address(this), "Snag: self destination");

        uint256 snagAmount = (msg.value * feeBps) / BPS_DENOMINATOR;
        uint256 sendAmount = msg.value - snagAmount;

        (bool s1, ) = charityWallet.call{value: snagAmount}("");
        require(s1, "Snag: charity transfer failed");

        (bool s2, ) = destination.call{value: sendAmount}("");
        require(s2, "Snag: destination transfer failed");

        emit Snagged(msg.sender, destination, msg.value, snagAmount, charityWallet);
    }

    /// @notice Send ERC20 tokens, snagging a small % for charity.
    /// @dev User must approve this contract for `amount` first.
    function snagAndSendERC20(address token, address destination, uint256 amount) external {
        require(amount > 0, "Snag: no amount");
        require(destination != address(0), "Snag: zero destination");
        require(destination != address(this), "Snag: self destination");

        IERC20 erc20 = IERC20(token);
        require(erc20.transferFrom(msg.sender, address(this), amount), "Snag: pull failed");

        uint256 snagAmount = (amount * feeBps) / BPS_DENOMINATOR;
        uint256 sendAmount = amount - snagAmount;

        require(erc20.transfer(charityWallet, snagAmount), "Snag: charity token transfer failed");
        require(erc20.transfer(destination, sendAmount), "Snag: destination token transfer failed");

        emit Snagged(msg.sender, destination, amount, snagAmount, charityWallet);
    }

    // Allow owner to recover stuck tokens (not ETH held intentionally)
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(owner, amount), "Snag: recover failed");
    }
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}
