# Snag MCP Server — Build Spec

> **GATE: DO NOT BUILD until BOTH are true:**
> 1. Smart contract audit complete, findings remediated
> 2. SnagRouterMulti deployed on Ethereum mainnet
>
> Reason: an MCP server lets AI agents move real user funds through Snag.
> Shipping it against unaudited or testnet-only contracts would repeat the
> credibility mistakes of the early launch. This spec exists so the build
> can start the day the audit lands.

## What it is

A [Model Context Protocol](https://modelcontextprotocol.io) server that exposes
Snag as tools any MCP-compatible AI agent (Claude, Cursor, etc.) can call.
A user tells their agent "send 0.5 ETH to Alice and snag 1% for clean water" —
the agent calls Snag's tools instead of the user touching a wallet UI.

## Tools to expose

| Tool | Type | Description |
|---|---|---|
| `snag_quote` | read-only | Given amount + cause, returns the exact 1%/99% split (wei amounts, USD estimate). No funds move. |
| `snag_causes` | read-only | Lists the 8 causes with ids, names, and on-chain wallet addresses. |
| `snag_send` | **write** | Executes `snagAndSend(charityId, destination)` on SnagRouterMulti. Moves real funds. |
| `snag_verify` | read-only | Given a tx hash, confirms the 1% reached the registered charity wallet (reads chain state). Powers the transparency story. |

### `snag_send` parameters

- `cause` (string, required) — cause id, e.g. `clean-water`
- `destination` (address, required) — where the 99% goes
- `amountEth` (string, required) — total ETH to send (fee taken from this)
- `dryRun` (boolean, default true) — when true, returns the quote without broadcasting. The agent MUST present the quote and get explicit user confirmation before calling with `dryRun: false`.

## Architecture

- **Runtime:** Node.js, `@modelcontextprotocol/sdk` (stdio transport — standard for local agent use).
- **Chain access:** `ethers` v6, same as `eth/snag-eth.js`. Reuse its helpers (`snagSendEth`, router ABI) — extend the ABI with the Multi router's `snagAndSend(bytes32,uint256)`... (exact signature from `contracts/SnagRouterMulti.sol` at build time).
- **Config (env vars, never in tool payloads):**
  - `SNAG_RPC_URL` — mainnet RPC endpoint
  - `SNAG_ROUTER_ADDRESS` — mainnet SnagRouterMulti address
  - `SNAG_SIGNER_KEY` — user's private key. The server never logs it, never returns it, never includes it in any response.
- **Repo layout:** `mcp/` — `server.js`, `package.json`, `README.md` (install + Claude Desktop / Cursor config snippets).

## Security rules (non-negotiable)

1. `dryRun` defaults to true; real broadcasts require the agent to have shown the user the exact quote first.
2. `destination` and `cause` are validated (address checksum, cause id in registry) before any signing.
3. The server refuses to run against any chain id other than mainnet (1) — no testnet key accidents.
4. Private key lives only in env; every error path redacts it.
5. Rate-limit `snag_send` per session (e.g. max 5 broadcasts) to blunt prompt-injection fund drains.

## Distribution (after build + test)

1. Test locally with Claude Desktop (stdio config) — 3 end-to-end sends on mainnet, small amounts.
2. List on **Smithery** (`smithery.ai`) — the main MCP registry; supports install counting.
3. List on **mcp.so** and **PulseMCP** for discovery.
4. Announce alongside the mainnet launch (the MCP server IS the "agents" story for press).

## Build checklist (for build day)

- [ ] Audit complete, mainnet router deployed, address recorded in `deployments/mainnet.json`
- [ ] `mcp/package.json` + `server.js` implementing the 4 tools
- [ ] Reuse/extend `eth/snag-eth.js` helpers for the Multi router
- [ ] Local Claude Desktop test: quote → dry run → 3 live small sends → verify
- [ ] README with one-command install for Claude Desktop and Cursor
- [ ] Publish to Smithery + mcp.so + PulseMCP
- [ ] Announce with mainnet launch
