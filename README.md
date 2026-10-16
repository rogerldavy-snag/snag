# Snag

Snag — frictionless per-send charity fee for ETH and BTC
Opt-in charity fee on crypto sends. Every time a user sends through Snag, **1%** is snagged and routed to a specific charity wallet they choose.

Fully opt-in: users choose to send via Snag and pick the cause. Nothing is taken from wallets that don't use it.

## Charity wallets (8 causes)

All wallets were generated for you and are in `charities.json`. Private keys are in `wallets/secrets.json` (mode 600 — back this up offline, never share).

| Cause | Description | ETH | BTC |
|-------|-------------|-----|-----|
| Pampers for the Poor | Diapers, wipes, baby formula | `0x959FFEa9005b63da0d86A75312e22351F568E59B` | `bc1q7wtjrrj8guyq9ju3hd7d7kq43607mu9yms5qm2` |
| Utility Bill Help for Single Mothers | Electricity, water, heating | `0x85E011D62EC85094340Cc35b71378aE0B0dDE875` | `bc1qkjzwzuv4e9snddl4aj4nlz7ksn2s96sc9ndlwp` |
| Groceries for Families | Weekly groceries, food banks | `0xF0484170Ef2Edd1EC1eE5929E6af63C8Afce5e65` | `bc1q7kh39thsnac8ln3tagex8jeau3l4jvnywcx9e9` |
| School Supplies & Education | Books, laptops, tuition | `0x74CFACc5D0Fe4859A6C24ae6A3eeE0e12b491be3` | `bc1q4ex8ud9dk33p0tvy2a7z74shzz3tmls85nam8u` |
| Medical Bill Relief | Prescriptions, clinic visits | `0x63b4CAB6dfd8Af2E9119699a393CdEcbCb892b11` | `bc1qn3r259znmlnxa4jwgxsm3hreja8fpk2gmz6vwg` |
| Shelter & Warm Beds | Homeless shelter, blankets | `0x8b8454B9973EA7dd24dbd9afb93fd3439215D8f8` | `bc1qav9erk7axxgmhqw7h4l8aherm08rlj7nquqf23` |
| Clean Water Projects | Wells and filtration | `0x7D0D044F3cc5ccc90eF59dfbd0D75c6D37dB1487` | `bc1qrllrwq0d57ljsgytv8s2vr7ffxe6spzt7nq8np` |
| Emergency Disaster Relief | Fires, floods, storms | `0x18ABdFFb2719bA666C7CFA6E5D9E38a6Fb736e87` | `bc1qwfecfudcuqkvw63avmzcva0pgl9nm9e9a0vkd0` |

Want more? Just run `node generate-wallets.js` again after adding to the `causes` list — or tell Sincere and I'll add them.

## How it works

### Ethereum
- `contracts/SnagRouter.sol` — single charity (simple).
- `contracts/SnagRouterMulti.sol` — **recommended**: holds all 8 charities, sender picks `charityId` like `"diapers-baby"`.

Deploy `SnagRouterMulti` with fee `100` (1%), then call `addCharity(id, wallet)` for each cause (use addresses above).

Send:
```js
const { snagSendEthToCharity } = require("./eth/snag-eth");
await snagSendEthToCharity({
  routerAddress: "0xYOUR_ROUTER",
  signer,
  charityId: "single-moms-utilities", // user picks!
  destination: "0xDESTINATION",
  amountWei: ethers.parseEther("0.1"),
});
```

### Bitcoin
`btc/snag-btc.js` builds a PSBT with two outputs: destination + chosen charity.

```js
const config = require("./config");
const charity = config.getCharity("diapers-baby");
const { psbtBase64 } = buildSnagPsbt({
  utxos,
  destinationAddress,
  amountSats: 50000,
  charityAddress: charity.btcAddress,
  changeAddress,
});
```

## Config
`config.js`:
- `feeBps: 100` (1%)
- `charities` — loaded from `charities.json`
- `getCharity(id)` helper

## Security
- Private keys in `wallets/secrets.json` + `wallets/BACKUP.txt` (both mode 600). **Back up offline now.** If you lose them, charity funds are unrecoverable.
- Never commit `wallets/` to git.
- ETH fee capped at 10% in-contract to prevent misconfiguration.
- BTC dust check: snag < 546 sats rejected.

## Tracking (Sincere)
- ETH: listen for `Snagged` events on the multi-router — filter by charityId.
- BTC: scan for outputs to each charity address in `charities.json`.

Next ideas: web "Send with Snag" picker UI, split a single snag across multiple causes, monthly totals dashboard.
