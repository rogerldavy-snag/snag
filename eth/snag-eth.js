// Snag ETH — send ETH / ERC20 through the SnagRouter so a small % goes to charity.
// Add-on model, Oct 31 2026: amountWei / amount is the exact amount the
// destination receives; the sender pays 1% on top to the cause.
// Requires ethers v6.

const { ethers } = require("ethers");
const config = require("../config");

// Minimal ABI for our SnagRouter
const SNAG_ABI = [
  "function snagAndSend(address payable destination, uint256 amount) payable",
  "function snagAndSendERC20(address token, address destination, uint256 amount)",
  "function feeBps() view returns (uint256)",
  "function charityWallet() view returns (address)",
];

async function getRouter(signerOrProvider, routerAddress) {
  return new ethers.Contract(routerAddress, SNAG_ABI, signerOrProvider);
}

/**
 * Send ETH with a charity snag.
 * @param {object} opts
 * @param {string} opts.routerAddress - deployed SnagRouter address
 * @param {ethers.Signer} opts.signer - signer with ETH
 * @param {string} opts.destination - where the main funds go
 * @param {string|bigint} opts.amountWei - exact amount the destination receives (snag is paid on top)
 */
async function snagSendEth({ routerAddress, signer, destination, amountWei }) {
  const router = await getRouter(signer, routerAddress);
  const feeBps = await router.feeBps();
  const charity = await router.charityWallet();

  const amount = BigInt(amountWei);
  const snag = (amount * BigInt(feeBps)) / 10000n;
  const total = amount + snag;
  console.log(`Snag: sending ${amount} wei -> ${destination}`);
  console.log(`Snag: ${snag} wei (${feeBps} bps) -> charity ${charity}`);
  console.log(`Snag: total paid ${total} wei (amount + snag)`);

  const tx = await router.snagAndSend(destination, amount, { value: total });
  console.log("Tx hash:", tx.hash);
  const receipt = await tx.wait();
  console.log("Confirmed in block", receipt.blockNumber);
  return receipt;
}

/**
 * Send ERC20 with a charity snag. Caller must approve router first.
 * amount is the exact amount the destination receives; approve amount + snag.
 */
async function snagSendErc20({ routerAddress, signer, tokenAddress, destination, amount }) {
  const router = await getRouter(signer, routerAddress);
  const feeBps = await router.feeBps();
  const erc20 = new ethers.Contract(
    tokenAddress,
    ["function approve(address spender, uint256 amount) returns (bool)"],
    signer
  );
  const destAmount = BigInt(amount);
  const snag = (destAmount * BigInt(feeBps)) / 10000n;
  const total = destAmount + snag;
  console.log(`Approving ${total} tokens (destination ${destAmount} + snag ${snag})...`);
  await (await erc20.approve(routerAddress, total)).wait();
  const tx = await router.snagAndSendERC20(tokenAddress, destination, destAmount);
  console.log("Tx hash:", tx.hash);
  return tx.wait();
}

// --- Multi-charity router (SnagRouterMulti) ---
const SNAG_MULTI_ABI = [
  "function snagAndSend(string charityIdStr, address payable destination, uint256 amount) payable",
  "function feeBps() view returns (uint256)",
  "function charityWallets(bytes32) view returns (address)",
];

/**
 * Send ETH with a charity snag to a specific cause.
 * @param {object} opts
 * @param {string} opts.routerAddress - deployed SnagRouterMulti address
 * @param {ethers.Signer} opts.signer
 * @param {string} opts.charityId - e.g. "diapers-baby" (must be added via addCharity)
 * @param {string} opts.destination
 * @param {string|bigint} opts.amountWei - exact amount the destination receives (snag is paid on top)
 */
async function snagSendEthToCharity({ routerAddress, signer, charityId, destination, amountWei }) {
  const router = new ethers.Contract(routerAddress, SNAG_MULTI_ABI, signer);
  const feeBps = await router.feeBps();
  const charity = config.getCharity(charityId);
  const amount = BigInt(amountWei);
  const snag = (amount * BigInt(feeBps)) / 10000n;
  const total = amount + snag;
  console.log(`Snag: ${charity.name} (${charityId})`);
  console.log(`Snag: ${amount} wei -> ${destination}, ${snag} wei snag, total paid ${total} wei`);
  const tx = await router.snagAndSend(charityId, destination, amount, { value: total });
  console.log("Tx hash:", tx.hash);
  return tx.wait();
}

module.exports = { snagSendEth, snagSendErc20, SNAG_ABI, snagSendEthToCharity, SNAG_MULTI_ABI };

// --- Example usage (uncomment to run) ---
// (async () => {
//   const provider = new ethers.JsonRpcProvider(config.ethRpcUrl);
//   const signer = new ethers.Wallet("0xYOUR_PRIVATE_KEY", provider);
//   await snagSendEth({
//     routerAddress: "0xYOUR_ROUTER_ADDRESS",
//     signer,
//     destination: "0xDESTINATION",
//     amountWei: ethers.parseEther("0.1"),
//   });
// })();
