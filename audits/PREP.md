# Snag — Audit Preparation Package

> Status: PRE-AUDIT. Code is feature-frozen for audit as of the commit noted below.
> No changes to `contracts/` until the audit completes.

## Scope (in scope)

| Contract | Lines | Purpose |
|---|---|---|
| `contracts/SnagRouterMulti.sol` | 66 | Multi-cause router: `snagAndSend(charityId, destination)` splits msg.value 1% → charity, 99% → destination |
| `contracts/SnagRouter.sol` | 92 | Single-cause router + ERC20 variant + `recoverERC20` |
| **Total** | **158** | |

- Solidity `^0.8.20`, compiled with 0.8.37, optimizer enabled (200 runs).
- Test suite: `test/snag.test.js` — 18 tests, all passing (`npx hardhat test`).
- Reference deployment (Sepolia): `0x02Fad5B35aA4c73385cA166Edb3Da9ae9EC0b520`
  ([Etherscan](https://sepolia.etherscan.io/address/0x02Fad5B35aA4c73385cA166Edb3Da9ae9EC0b520)) — all 8 cause wallets registered, end-to-end test snag confirmed (block 11937972).

## Out of scope

- `btc/snag-btc.js` — off-chain Bitcoin PSBT construction library (no on-chain code).
- `eth/snag-eth.js`, `eth/deploy-sepolia.js` — client/deployment scripts.
- `contracts/mocks/MockERC20.sol` — test-only mock, never deployed outside tests.

## Intended invariants (for the auditor to verify)

1. **Conservation:** `snagAmount + sendAmount == msg.value` on every `snagAndSend` (no ETH retained; router balance is always 0 after a call).
2. **Fee math:** `snagAmount = msg.value * feeBps / 10000`, rounded down; `feeBps <= 1000` (10%) enforced in constructor and `setFeeBps`.
3. **Access control:** only `owner` can call `addCharity`, `setCharityWallet`, `setFeeBps`, `recoverERC20`.
4. **No zero-address sinks:** charity wallet and destination must be non-zero (checked on write and per-send).
5. **Charity registry integrity:** `snagAndSend` reverts on unregistered charity id (`Snag: unknown charity`); re-registering an id replaces the wallet and emits `CharityAdded` again.
6. **No custody:** the router never holds user funds beyond the atomic call; `recoverERC20` only touches ERC20 (not ETH) and only pays out to `owner`.

## Known considerations (disclosed, not hidden)

- **Dust rounding:** for tiny sends (< 100 wei at 1%), the snag rounds to 0 and the destination receives everything. Accepted as correct behavior (documented in tests).
- **Charity wallet trust:** charity wallets are EOAs controlled by the project steward pre-partnership. The contract cannot verify off-chain disbursement — that's what the transparency dashboard (planned) addresses.
- **`recoverERC20`:** owner-only escape hatch for tokens accidentally sent to the router. Cannot touch ETH.
- **Fee changes:** `setFeeBps` is owner-only and capped at 10%; fee changes apply to subsequent sends only.
- **No upgradeability:** contracts are immutable once deployed; fixes require redeployment.

## Auditor logistics

- Preferred: OpenZeppelin, Trail of Bits, or Cyfrin (per Arbitrum Audit Program application).
- Subsidy applications in flight: Arbitrum Audit Program ($10M ARB pool), EF $1M Security Subsidy via Areta (up to 30% of cost, November cohort).
- Target: audit complete + fixes within ~8 weeks of engagement.

## Freeze notice

Do not modify anything under `contracts/` (except `contracts/mocks/`) until the audit report is delivered. All post-freeze changes must be re-reviewed.
