// Snag config — 1% fee, multiple charity wallets.
// Fee is in basis points: 100 = 1%

const charities = require("./charities.json");

module.exports = {
  feeBps: 100, // 1% — confirmed by Divine

  // Full list of causes (each has ethAddress + btcAddress)
  charities,

  // Default cause if user doesn't pick one
  defaultCharityId: "diapers-baby",

  // Helper: get charity by id
  getCharity(id) {
    return charities.find((c) => c.id === (id || this.defaultCharityId)) || charities[0];
  },

  // Networks
  ethRpcUrl: "https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY",
  btcNetwork: "mainnet",
};
