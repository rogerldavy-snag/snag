# Snag — Audit Preparation Package

> Status: PRE-AUDIT. Code is feature-frozen for audit as of 2026-10-31 (add-on model, below).
> No changes to `contracts/` until the audit completes.

## Add-on note (2026-10-31)

The Oct 22 refreeze code was the old split model (recipient got msg.value minus 1%). On Divine's approval on Oct 31, 2026, both contracts were rewritten to the add-on model: the recipient gets exactly the intended amount, and the charity gets 1% on top, paid by the sender. The split code is preserved in the local tags `legacy/split-oct17-deployed` and `legacy/split-oct22-refreeze`. The Sepolia deployment below still runs the Oct 17 split code; an add-on redeploy with verified source is still to come.

## Refreeze note (2026-10-22)

The Oct 17 freeze was lifted once, on Divine's approval, to apply the three cheap hardening fixes from the FYEO AI scan, as Cyfrin (Namd Teotrakool) recommended on the Oct 22 intro call so the public report publishes clean:
- **A. Owner rotation:** `transferOwnership` + `renounceOwnership` on both contracts.
- **B. Charity wallet changes are now two step:** SnagRouter `proposeCharityWallet` / `confirmCharityWallet` with a 1 day delay; `addCharity` on Multi reverts if the id already has a wallet, and wallet updates go through `proposeCharityWalletUpdate` / `confirmCharityWalletUpdate` with a 1 day delay.
- **C. Self send guard + ETH recovery:** both send functions revert when the destination is the contract itself; `recoverETH` added to SnagRouterMulti.
- Fixes E and F from the scan were deliberately NOT applied (they change send path semantics; auditor steer first). D, G, H documented only.

Test suite is now 30 tests, all passing. The Sepolia deployment below predates the add-on change and still runs the Oct 17 split code.

## Scope (in scope)

| Contract | Lines | Purpose |
|---|---|---|
| `contracts/SnagRouterMulti.sol` | 147 | Multi-cause router: `snagAndSend(charityId, destination, amount)` — recipient gets exactly `amount`, charity gets 1% on top, paid by the sender |
| `contracts/SnagRouter.sol` | 150 | Single-cause router + ERC20 variant + `recoverERC20` — same add-on rule |
| **Total** | **297** | |

- Solidity `^0.8.20`, compiled with 0.8.37, optimizer enabled (200 runs).
- Test suite: `test/snag.test.js` — 30 tests, all passing (`npx hardhat test`).
- Reference deployment (Sepolia): `0x02Fad5B35aA4c73385cA166Edb3Da9ae9EC0b520`
  ([Etherscan](https://sepolia.etherscan.io/address/0x02Fad5B35aA4c73385cA166Edb3Da9ae9EC0b520)) — all 8 cause wallets registered, end-to-end test snag confirmed (block 11937972).

## Out of scope

- `btc/snag-btc.js` — off-chain Bitcoin PSBT construction library (no on-chain code).
- `eth/snag-eth.js`, `eth/deploy-sepolia.js` — client/deployment scripts.
- `contracts/mocks/MockERC20.sol` — test-only mock, never deployed outside tests.

## Intended invariants (for the auditor to verify)

1. **Conservation:** `amount + snagAmount == msg.value` on every `snagAndSend` (the sender pays exactly the intended amount plus the 1% add-on; no ETH retained; router balance is always 0 after a call). A short or over payment reverts.
2. **Fee math:** `snagAmount = amount * feeBps / 10000`, rounded down, where `amount` is the exact amount the destination receives; `feeBps <= 1000` (10%) enforced in constructor and `setFeeBps`.
3. **Access control:** only `owner` can call `addCharity`, the propose/confirm wallet change functions, `setFeeBps`, `recoverERC20`, `recoverETH`, `transferOwnership`, `renounceOwnership`.
4. **No zero-address sinks:** charity wallet and destination must be non-zero (checked on write and per-send); sends to the contract itself revert (`Snag: self destination`).
5. **Charity registry integrity:** `snagAndSend` reverts on unregistered charity id (`Snag: unknown charity`); `addCharity` reverts if the id already has a wallet (`Snag: charity exists`) — no silent overwrites. Wallet changes take effect only after a 1 day delay via propose then confirm.
6. **No custody:** the router never holds user funds beyond the atomic call; `recoverERC20` (SnagRouter) and `recoverETH` (SnagRouterMulti) are owner-only escape hatches that pay out only to `owner`.

## Known considerations (disclosed, not hidden)

- **Dust rounding:** for tiny intended amounts (< 100 wei at 1%), the snag rounds to 0 and the destination receives the full intended amount. Accepted as correct behavior (documented in tests).
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
