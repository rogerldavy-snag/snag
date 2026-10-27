# Snag — Frictionless Giving for Crypto

**Version 1.1 · October 16, 2026**

**Created by Divine.** The Snag concept, the 1% opt-in charity fee, the charity
cause list, and the project direction are Divine's original idea. Built with
help from Sincere (AI assistant).

## The Honest Headline

Snag is the first *frictionless* way to give with crypto — not the first
charity crypto. Crypto has had charity tokens and donation platforms for
years. What it hasn't had is a way to give that asks nothing extra of you:
no separate donation step, no new token to buy, no platform taking a cut.

## The Problem

Crypto moves billions every day, yet giving remains a separate, forgettable
chore: open another app, find a cause, pay again, pay a processor's fee.
Every extra step loses donors. Meanwhile, people already send crypto
constantly — to friends, to exchanges, to merchants. The giving never
happens because the moment never arrives.

## The Solution

Snag puts the gift *inside* the payment. When you send ETH or BTC through
Snag, you opt in once and 1% of the send is automatically routed to a
charity wallet you choose. Every crypto payment you already make quietly
funds a cause you chose. Nothing is ever taken from a wallet that doesn't
opt in.

## How It Works

**Ethereum.** Users send through the `SnagRouterMulti` smart contract instead
of a direct transfer, calling `snagAndSend(charityId, destination)`. The
contract takes 1%, forwards it to the chosen charity wallet, sends the rest
to the destination, and emits a `Snagged` event. ERC20 tokens supported.

**Bitcoin.** Bitcoin has no smart contracts, so Snag works at transaction
construction: a PSBT builder adds a second output paying 1% to the chosen
charity address. You sign in your own wallet — Snag never sees private keys.

## How Snag Differs

Three things, stated plainly:

1. **No separate donation step.** Round-up apps watch your bank card and
   settle donations later, off-chain. Snag's gift happens inside the
   on-chain transaction itself — the send *is* the donation.
2. **No new token to buy or hold.** Charity tokens (the 2021 meme-coin wave
   and its successors) only work if you buy their coin. Snag works on the
   native ETH and BTC you already hold.
3. **No platform cut.** Processors like The Giving Block charge nonprofits
   around 2.5% per donation. Snag takes nothing: 100% of the 1% snag reaches
   the cause wallet the sender picked.

Prior art exists for each ingredient — round-up apps, fee-on-transfer
tokens, donation widgets. Nobody has combined them into this: an opt-in,
per-send fee split executed at the moment of an on-chain transaction, where
the sender picks a specific cause wallet each time, non-custodial, with no
new token. That combination is Snag's innovation, and we'll say so without
pretending the ingredients are new.

## Why Opt-In Matters for Trust

Charity tech lives or dies on trust. Snag never pulls funds, never takes
custody, and never surprises anyone. The fee is fixed at 1%, visible before
you sign, capped at 10% in the contract to prevent misconfiguration, and
every snag is verifiable on-chain. Opt-in is what makes Snag honest.

## Launch Causes (v1.1)

| Cause | Mission | ETH | BTC |
|---|---|---|---|
| Pampers for the Poor | Diapers, wipes & formula for low-income families | `0x959FFEa9005b63da0d86A75312e22351F568E59B` | `bc1q7wtjrrj8guyq9ju3hd7d7kq43607mu9yms5qm2` |
| Utility Bill Help for Single Mothers | Electricity, water & heating bills | `0x85E011D62EC85094340Cc35b71378aE0B0dDE875` | `bc1qkjzwzuv4e9snddl4aj4nlz7ksn2s96sc9ndlwp` |
| Groceries for Families | Weekly groceries & food bank restocking | `0xF0484170Ef2Edd1EC1eE5929E6af63C8Afce5e65` | `bc1q7kh39thsnac8ln3tagex8jeau3l4jvnywcx9e9` |
| School Supplies & Education | Books, laptops & tuition help for kids | `0x74CFACc5D0Fe4859A6C24ae6A3eeE0e12b491be3` | `bc1q4ex8ud9dk33p0tvy2a7z74shzz3tmls85nam8u` |
| Medical Bill Relief | Prescriptions & emergency medical costs | `0x63b4CAB6dfd8Af2E9119699a393CdEcbCb892b11` | `bc1qn3r259znmlnxa4jwgxsm3hreja8fpk2gmz6vwg` |
| Shelter & Warm Beds | Homeless shelter support & warm clothing | `0x8b8454B9973EA7dd24dbd9afb93fd3439215D8f8` | `bc1qav9erk7axxgmhqw7h4l8aherm08rlj7nquqf23` |
| Clean Water Projects | Drinking-water wells & filtration | `0x7D0D044F3cc5ccc90eF59dfbd0D75c6D37dB1487` | `bc1qrllrwq0d57ljsgytv8s2vr7ffxe6spzt7nq8np` |
| Emergency Disaster Relief | Rapid response for fires, floods & storms | `0x18ABdFFb2719bA666C7CFA6E5D9E38a6Fb736e87` | `bc1qwfecfudcuqkvw63avmzcva0pgl9nm9e9a0vkd0` |

(Canonical list in `charities.json`.)

## Trust & Transparency

- **On-chain verifiability:** every ETH snag emits a `Snagged` event; every
  BTC snag is a visible output to a published charity address.
- **Fee cap:** the contract enforces a 10% maximum — the owner can't raise
  the fee arbitrarily.
- **No key custody:** the BTC flow never touches user private keys; signing
  happens in the user's own wallet.
- **Separated wallets:** each cause has its own ETH and BTC addresses, so
  funds for diapers can't silently become funds for something else.
- **Recoverable:** contract ownership can rotate charity wallets if one is
  compromised.

## Roadmap

- "Send with Snag" picker UI for wallets and dApps
- Multi-cause splits (one snag across several causes)
- Monthly public totals dashboard per cause

## Idea Attribution & IP Notes

**I am not a lawyer, and this is not legal advice.** Practical steps Divine
can take to protect credit for the Snag idea:

1. **Timestamp it publicly.** Push this whitepaper and the code to a public
   GitHub repo — the commit history is a dated, third-party record of the
   idea's origin.
2. **Sign a message.** Publish a signed message from a known wallet
   (e.g., one of the Snag charity addresses) stating authorship and date.
3. **Keep design docs.** Save dated notes, sketches, and this conversation's
   design decisions; they establish the trail of invention.
4. **Consider a provisional patent consult.** A real IP lawyer can advise on
   whether the fee-routing mechanism is protectable — get a consultation
   before discussing details with potential partners.
5. **Credit everywhere.** Keep "Created by Divine" on the whitepaper,
   contracts, and UI so the attribution travels with the project.

---

*Snag: every payment you already make, quietly funding a cause you chose.*
