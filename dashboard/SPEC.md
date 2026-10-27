# Snag Transparency Dashboard — Build Spec

> **Purpose:** The dashboard is the credibility answer to "where does the 1%
> actually go?" Every snag is verifiable on chain; the dashboard makes that
> verification human readable. It is the rung on the credibility ladder between
> audit and named charity partners.
>
> **Build timing:** A Sepolia prototype can be built now (testnet data exists).
> The production version ships with mainnet launch.

## What it shows

1. **Hero stats:** total snagged to date (ETH + USD), total sends routed, number
   of causes, all time.
2. **Per cause cards:** the 8 causes, each with total received, number of snags,
   wallet address (copy button), and a link to the address on the block explorer.
3. **Live feed:** most recent snags — tx hash, amount, cause, destination,
   timestamp. Each row links to the explorer tx page.
4. **Verify view:** paste any Snag tx hash, see the 1%/99% split proven from
   chain state (reads the Snagged event + transfer traces).

## Data source

- Primary: `Snagged` events emitted by SnagRouterMulti (charity, destination,
  snagAmount, sendAmount). An indexer watches the router address from deploy
  block forward.
- Prototype indexer: simple Node script polling via RPC (`eth_getLogs`),
  storing to SQLite/JSON. No subgraph needed for v1.
- Later: move to a proper indexer (e.g. envio, Ponder) when volume grows.

## Architecture

- **Frontend:** static page (reuse the landing page style in `landing-page/`),
  reads from a small JSON API or prebuilt JSON file. No wallet connection
  needed — it is read only.
- **Indexer:** `dashboard/indexer.js` — polls Sepolia (prototype) / mainnet
  (production) for Snagged events, writes `dashboard/data/snags.json`.
- **Hosting:** same GitHub Pages site as the landing page (`/dashboard` path),
  rebuilt on each indexer run. Zero infra cost.
- **Refresh:** indexer runs on a cron (hourly is plenty at expected volume).

## Trust properties (make these explicit in the UI)

- Every number links to the underlying on chain data (explorer links).
- "Verify this snag" is a first class action, not buried.
- The dashboard never claims off chain disbursement — it proves the 1%
  reached the registered cause wallet. What happens after (fiat off ramp,
  charity spending) is labeled as reported by the cause steward, not proven.

## Build checklist

- [ ] `dashboard/indexer.js` — event polling for the Sepolia router, JSON output
- [ ] `dashboard/` frontend — hero stats, cause cards, live feed, verify view
- [ ] Deploy prototype to GitHub Pages `/dashboard` reading Sepolia data
- [ ] After mainnet: point indexer at mainnet router, redeploy
- [ ] Announce with mainnet launch (dashboard + MCP server + audit = the story)
