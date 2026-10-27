// Snag testnet deploy — Sepolia.
// Usage:
//   SEPOLIA_RPC_URL="https://..." DEPLOYER_KEY="0x..." node eth/deploy-sepolia.js
// Never hardcode keys. Testnet only — do not point at mainnet.

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const config = require("../config");

const ROOT = path.join(__dirname, "..");
const BIN = fs.readFileSync(path.join(ROOT, "build", "contracts_SnagRouterMulti_sol_SnagRouterMulti.bin"), "utf8").trim();
const ABI = JSON.parse(fs.readFileSync(path.join(ROOT, "build", "contracts_SnagRouterMulti_sol_SnagRouterMulti.abi"), "utf8"));

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const key = process.env.DEPLOYER_KEY;
  if (!rpcUrl || !key) {
    console.error("Set SEPOLIA_RPC_URL and DEPLOYER_KEY env vars first.");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const net = await provider.getNetwork();
  if (net.chainId !== 11155111n) {
    console.error(`Refusing: chain ${net.chainId} is not Sepolia (11155111).`);
    process.exit(1);
  }
  const wallet = new ethers.Wallet(key, provider);
  const bal = await provider.getBalance(wallet.address);
  console.log("Deployer:", wallet.address);
  console.log("Balance:", ethers.formatEther(bal), "SepoliaETH");
  if (bal === 0n) { console.error("No Sepolia ETH — fund the deployer from a faucet first."); process.exit(1); }

  // 1. Deploy SnagRouterMulti(100) = 1%
  console.log("\nDeploying SnagRouterMulti(100)...");
  const factory = new ethers.ContractFactory(ABI, "0x" + BIN.replace(/^0x/, ""), wallet);
  const router = await factory.deploy(100);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("Router deployed at:", routerAddr);

  // 2. Register the 8 causes
  console.log("\nRegistering charities...");
  for (const c of config.charities) {
    const tx = await router.addCharity(c.id, c.ethAddress);
    await tx.wait();
    console.log(`  ${c.id} -> ${c.ethAddress}`);
  }

  // 3. Tiny end-to-end test: 0.001 ETH through "diapers-baby" to self
  console.log("\nTest snag: 0.001 ETH via diapers-baby -> self...");
  const testTx = await router.snagAndSend("diapers-baby", wallet.address, {
    value: ethers.parseEther("0.001"),
  });
  const receipt = await testTx.wait();
  console.log("Test snag confirmed in block", receipt.blockNumber, "| tx:", receipt.hash);

  // 4. Save deployment record
  const outDir = path.join(ROOT, "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const record = {
    network: "sepolia",
    chainId: 11155111,
    router: routerAddr,
    feeBps: 100,
    deployer: wallet.address,
    testTx: receipt.hash,
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, "sepolia.json"), JSON.stringify(record, null, 2));
  console.log("\nDeployment record saved to deployments/sepolia.json");
  console.log("Verify on Etherscan: https://sepolia.etherscan.io/address/" + routerAddr);
}

main().catch((e) => { console.error(e); process.exit(1); });
