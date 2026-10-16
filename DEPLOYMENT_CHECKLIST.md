# Snag — Deployment Checklist

> Nothing here runs without Divine's explicit approval. Deploying costs real
> money (gas) and puts real contracts on-chain. Read fully before approving.

## What "deployed" means

- **Ethereum:** `SnagRouterMulti.sol` deployed once. Then `addCharity(id, wallet)`
  called 8 times (once per cause). After that anyone can call
  `snagAndSend(charityId, destination)` with ETH and 1% routes to the chosen
  charity wallet. Contract source is in `contracts/SnagRouterMulti.sol`.
- **Bitcoin:** nothing to deploy. `btc/snag-btc.js` is a library wallets/apps
  integrate — it builds the PSBT with the extra charity output.

## Before mainnet — do testnet first (strongly recommended)

1. Get Sepolia ETH from a faucet.
2. Deploy `SnagRouterMulti` with fee `100` (1%) to Sepolia.
3. Call `addCharity` for all 8 ids with the addresses in `charities.json`.
4. Send a tiny test amount through `snagAndSend("diapers-baby", <your address>)`.
5. Confirm: 1% arrived at the charity wallet, 99% at the destination,
   `Snagged` event emitted.
6. Verify the contract source on Sepolia Etherscan (flattens trust).

Only go to mainnet when testnet is clean.

## Mainnet deployment — needs from Divine

- [ ] **Deployer wallet + gas ETH.** Approx cost: contract deploy + 8
      `addCharity` calls. Budget ~0.05–0.15 ETH depending on gas prices
      (check current prices before approving).
- [ ] **Explicit approval to spend** that gas from the deployer wallet.
- [ ] **Charity address re-verification.** Confirm every address in
      `charities.json` is correct and you hold the keys
      (`wallets/secrets.json`, backed up offline).
- [ ] **Fee confirmation:** 100 bps = 1%. (Changeable later by owner via
      `setFeeBps`, capped at 1000 bps / 10%.)
- [ ] **Etherscan verification** of the deployed source after deploy.
- [ ] **First real mainnet test:** small amount, one cause, verify both
      legs arrive before announcing.

## After deploy — Sincere can do

- Monitor `Snagged` events and report totals per cause / per week.
- Draft the launch announcement from `PROMO_DRAFTS.md` (needs your sign-off).
- Publish the demo page link once you approve sharing.

## Do NOT

- Do not deploy from a wallet whose key you haven't backed up.
- Do not change charity wallets without announcing it publicly first —
  that is the trust the whole project runs on.
- Do not take a builder fee cut without disclosing it (see
  `COMPENSATION_OPTIONS.md`).
