// Generate ETH + BTC wallets for each Snag charity cause.
// Run: node generate-wallets.js
// Output: charities.json (public addresses) + wallets/secrets.json (PRIVATE - back up securely)

const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const bitcoin = require("bitcoinjs-lib");
const { ECPairFactory } = require("ecpair");
const tinysecp = require("tiny-secp256k1");

const ECPair = ECPairFactory(tinysecp);

const causes = [
  {
    id: "diapers-baby",
    name: "Pampers for the Poor",
    description: "Diapers, wipes, and baby formula for low-income families",
  },
  {
    id: "single-moms-utilities",
    name: "Utility Bill Help for Single Mothers",
    description: "Electricity, water, and heating bills for single-mom households",
  },
  {
    id: "groceries-families",
    name: "Groceries for Families",
    description: "Weekly groceries and food bank restocking",
  },
  {
    id: "school-supplies",
    name: "School Supplies & Education",
    description: "Books, backpacks, laptops, and tuition help for kids",
  },
  {
    id: "medical-relief",
    name: "Medical Bill Relief",
    description: "Prescriptions, clinic visits, and emergency medical costs",
  },
  {
    id: "shelter-warmth",
    name: "Shelter & Warm Beds",
    description: "Homeless shelter support, blankets, and warm clothing",
  },
  {
    id: "clean-water",
    name: "Clean Water Projects",
    description: "Clean drinking water wells and filtration",
  },
  {
    id: "disaster-relief",
    name: "Emergency Disaster Relief",
    description: "Rapid response for fires, floods, and storms",
  },
];

function genEth() {
  const w = ethers.Wallet.createRandom();
  return { address: w.address, privateKey: w.privateKey, mnemonic: w.mnemonic.phrase };
}

function genBtc(network = bitcoin.networks.bitcoin) {
  const keyPair = ECPair.makeRandom({ network });
  const pubkeyBuf = Buffer.from(keyPair.publicKey);
  const { address } = bitcoin.payments.p2wpkh({ pubkey: pubkeyBuf, network });
  return {
    address,
    wif: keyPair.toWIF(),
    privateKeyHex: Buffer.from(keyPair.privateKey).toString("hex"),
  };
}

const publicOut = [];
const secretOut = [];

for (const c of causes) {
  const eth = genEth();
  const btc = genBtc();
  publicOut.push({
    id: c.id,
    name: c.name,
    description: c.description,
    ethAddress: eth.address,
    btcAddress: btc.address,
  });
  secretOut.push({
    id: c.id,
    name: c.name,
    ethAddress: eth.address,
    ethPrivateKey: eth.privateKey,
    ethMnemonic: eth.mnemonic,
    btcAddress: btc.address,
    btcWIF: btc.wif,
    btcPrivateKeyHex: btc.privateKeyHex,
  });
  console.log(`${c.name}: ${eth.address} / ${btc.address}`);
}

const dir = __dirname;
fs.writeFileSync(path.join(dir, "charities.json"), JSON.stringify(publicOut, null, 2));
fs.mkdirSync(path.join(dir, "wallets"), { recursive: true });
fs.writeFileSync(
  path.join(dir, "wallets", "secrets.json"),
  JSON.stringify(secretOut, null, 2),
  { mode: 0o600 }
);
// Also write a human-readable backup sheet (still secret)
let sheet = "SNAG CHARITY WALLETS - SECRET BACKUP - STORE OFFLINE\n";
sheet += "Generated: " + new Date().toISOString() + "\n\n";
for (const s of secretOut) {
  sheet += `=== ${s.name} ===\nETH: ${s.ethAddress}\nETH key: ${s.ethPrivateKey}\nETH seed: ${s.ethMnemonic}\nBTC: ${s.btcAddress}\nBTC WIF: ${s.btcWIF}\n\n`;
}
fs.writeFileSync(path.join(dir, "wallets", "BACKUP.txt"), sheet, { mode: 0o600 });

console.log("\nWrote charities.json and wallets/secrets.json (mode 600)");
