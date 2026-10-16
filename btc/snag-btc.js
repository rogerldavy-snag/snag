// Snag BTC — build a Bitcoin tx with an extra charity output.
// Uses bitcoinjs-lib. The user signs; we never touch private keys.

const bitcoin = require("bitcoinjs-lib");
const config = require("../config");

function getNetwork(name) {
  return name === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
}

/**
 * Calculate the snag split.
 * @param {number} amountSats - total sats the user wants to move (before miner fee)
 * @param {number} feeBps - e.g. 100 = 1%
 * @returns {{ snagSats: number, destSats: number }}
 */
function calcSnag(amountSats, feeBps) {
  const snagSats = Math.floor((amountSats * feeBps) / 10000);
  return { snagSats, destSats: amountSats - snagSats };
}

/**
 * Build an unsigned PSBT with a charity output.
 *
 * @param {object} opts
 * @param {Array} opts.utxos - [{ txid, vout, value (sats), scriptPubKey hex }]
 * @param {string} opts.destinationAddress - main recipient
 * @param {number} opts.amountSats - amount to move (snag is taken from this)
 * @param {string} opts.charityAddress - charity recipient (defaults to config)
 * @param {number} opts.feeBps - defaults to config.feeBps
 * @param {number} opts.minerFeeSats - miner fee to pay
 * @param {string} opts.changeAddress - where change goes
 * @param {string} opts.networkName - "mainnet" | "testnet"
 * @returns {{ psbtBase64: string, snagSats: number, destSats: number }}
 */
function buildSnagPsbt({
  utxos,
  destinationAddress,
  amountSats,
  charityAddress = config.btcCharityAddress,
  feeBps = config.feeBps,
  minerFeeSats = 500,
  changeAddress,
  networkName = config.btcNetwork,
}) {
  const network = getNetwork(networkName);
  const { snagSats, destSats } = calcSnag(amountSats, feeBps);

  if (snagSats < 546) {
    throw new Error(`Snag amount ${snagSats} sats is dust — increase amountSats or feeBps`);
  }

  const totalIn = utxos.reduce((s, u) => s + u.value, 0);
  const totalOut = destSats + snagSats + minerFeeSats;
  if (totalIn < totalOut) throw new Error(`Insufficient funds: in=${totalIn} need=${totalOut}`);

  const change = totalIn - totalOut;

  const psbt = new bitcoin.Psbt({ network });
  for (const u of utxos) {
    psbt.addInput({
      hash: u.txid,
      index: u.vout,
      witnessUtxo: {
        script: Buffer.from(u.scriptPubKey, "hex"),
        value: BigInt(u.value),
      },
    });
  }

  psbt.addOutput({ address: destinationAddress, value: BigInt(destSats) });
  psbt.addOutput({ address: charityAddress, value: BigInt(snagSats) });
  if (change >= 546) {
    psbt.addOutput({ address: changeAddress || destinationAddress, value: BigInt(change) });
  }

  console.log(`Snag: ${destSats} sats -> ${destinationAddress}`);
  console.log(`Snag: ${snagSats} sats (${feeBps} bps) -> charity ${charityAddress}`);

  return { psbtBase64: psbt.toBase64(), snagSats, destSats };
}

module.exports = { buildSnagPsbt, calcSnag };

// --- Example ---
// const { psbtBase64 } = buildSnagPsbt({
//   utxos: [{ txid: "...", vout: 0, value: 100000, scriptPubKey: "..." }],
//   destinationAddress: "bc1q...",
//   amountSats: 50000,
//   changeAddress: "bc1q...change",
//   networkName: "testnet",
// });
// // Then sign with your wallet: psbt.fromBase64(psbtBase64).signAllInputs(keyPair)...
