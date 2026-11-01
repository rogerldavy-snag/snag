# Snag — Frictionless Giving for Crypto

**Version 1.2 · November 1, 2026**

**Created by Divine.** The Snag concept, the 1% opt-in charity add-on, the charity
cause list, and the project direction are Divine's original idea. Built with
help from Sincere (AI assistant).

**What changed in v1.2.** The model changed. In v1.1 the 1% came out of the
send, so the recipient got 99%. Now the recipient gets the full intended
amount and the sender adds 1% on top for the cause they pick. Nothing else
about the idea changed. The v1.1 whitepaper is archived.

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
Snag, you opt in once and add 1% on top of the amount, and that 1% goes to
a charity wallet you choose. The person you are sending to receives the
full amount you intended. Every crypto payment you already make quietly
funds a cause you chose. Nothing is ever taken from a wallet that doesn't
opt in.

## How It Works

**Ethereum.** Users send through the `SnagRouterMulti` smart contract instead
of a direct transfer, calling `snagAndSend(charityId, destination, amount)`
and sending amount plus 1%. The contract sends exactly `amount` to the
destination, sends the 1% on top to the chosen charity wallet, and emits a
`Snagged` event. ERC20 tokens follow the same rule: the recipient gets the
exact amount and the cause gets 1% on top.

Live on Sepolia: `SnagRouterMulti` at
`0x763705eB5e9125Dcbf769831368d5708292dA0d8`, source verified on Etherscan as
an exact match. The old split contract at
`0x02Fad5B35aA4c73385cA166Edb3Da9ae9EC0b520` is superseded. A test send is
confirmed in block 12037229: 0.001 ETH to the recipient in full, 0.00001
ETH on top to the cause.

**Bitcoin.** Bitcoin has no smart contracts, so Snag works at transaction
construction: a PSBT builder adds a second output paying 1% on top to the
chosen charity address, so the recipient still gets the full intended
amount. You sign in your own wallet — Snag never sees private keys. The
Bitcoin flow is built; no BTC transaction has been sent on chain yet.

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
per-send add-on executed at the moment of an on-chain transaction, where
the sender picks a specific cause wallet each time, non-custodial, with no
new token. That combination is Snag's innovation, and we'll say so without
pretending the ingredients are new.

## Why Opt-In Matters for Trust

Charity tech lives or dies on trust. Snag never pulls funds, never takes
custody, and never surprises anyone. The add-on is fixed at 1%, visible
before you sign, capped at 10% in the contract to prevent misconfiguration,
and every snag is verifiable on-chain. Opt-in is what makes Snag honest.

## Launch Causes (v1.2)

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
- **Recoverable:** a charity wallet can only change through a two step
  update with a one day delay, so no single transaction can silently
  redirect funds.
- **Custody:** the 1% stays in the cause wallet it was sent to. Nothing has
  moved anywhere yet. Divine holds the keys offline and decides where it
  goes until a named charity partner takes custody through a two step
  update. He will not move it to a different cause, and he will publish a
  report of what came in per cause, what went out, to whom, and when.
- **Audit:** a third party security audit proposal is in hand, with a public
  final report and a fix review included. No signed engagement, no payment,
  and no start date yet. The start waits on grant funding, and a fresh scope
  and quote reconfirm is needed for the new scope.

## Current Status (November 1, 2026)

- One deployed contract only: `SnagRouterMulti` on Sepolia at
  `0x763705eB5e9125Dcbf769831368d5708292dA0d8`, source verified on Etherscan
  as an exact match. `SnagRouter` is in the repo only and is not deployed.
- Code on GitHub main: 297 lines, 30 Hardhat tests passing.
- Demo live: "Send with Snag" at
  https://muse.ai/s/send-with-snag-nxk6txg1sxmsxzf/qXYQO3pPhxcfM9e-NkO0rRKIyB2eTISq3nvS8qd1iMA,
  with the custody note at the point of send.
- Snag is listed publicly on Giveth.
- Audit proposal in hand, no signed engagement yet; the start waits on grant
  funding.
- No mainnet deployment yet. No funds have moved anywhere.

## Roadmap

- "Send with Snag" demo is live; wallet and dApp integrations next
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
