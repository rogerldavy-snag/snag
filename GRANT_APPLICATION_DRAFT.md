# Snag — Grant Application Draft

> **STATUS: DRAFT — not submitted anywhere.** Divine must review, fill in the
> `[FILL IN]` fields, and submit personally. As of 2026-10-16 there is **no
> open Gitcoin round**: GG24 has concluded, and whether GG25 happens at all is
> uncertain — the GG25 matching-pool proposal (Gitcoin x Octant) was withdrawn
> from the governance forum, and on Oct 2, 2026 founder Kevin Owocki announced
> "Techne," a pivot away from crypto-native grant rounds toward local community
> tools (launching mid-Dec 2026). The play is to get the project profile +
> public repo ready now, then watch https://grants.gitcoin.co and
> https://gov.gitcoin.co for the next round announcement.

## Where to apply

**Primary target: Gitcoin Grants** — quadratic funding rounds for open-source
public goods. Best-fit categories for Snag:
- **dApps & Apps** (user-facing decentralized application), and/or
- **Community / ReFi rounds** (real-world impact, regenerative finance)

**Current status (checked 2026-10-16):** there is no open round right now.
GG24 has concluded, and whether GG25 happens at all is uncertain: the GG25
matching-pool proposal (Gitcoin x Octant, $100k–$300k) was withdrawn from the
governance forum (gov.gitcoin.co, Aug 2026), and on Oct 2, 2026 founder Kevin
Owocki announced "Techne," a pivot away from crypto-native grant rounds toward
local community tools, launching mid-Dec 2026. So there is nothing to apply to
yet — prepare now and apply if and when the next round opens. Announcements
appear at grants.gitcoin.co and gov.gitcoin.co.

**How it works (current flow):** register the Snag project once on Gitcoin
Builder (the project registry), then when a round opens, open that round on
grants.gitcoin.co and click Apply — select the Snag project, fill in the
round's fields, preview and submit. Round operators approve applications,
donations flow during the ~2-week donation window, funds are claimed after.
Small donations from many people get amplified by the matching pool —
breadth of support beats size of any single donation.

**Also adaptable to:** Ethereum Foundation ESP grants
(https://esp.ethereum.foundation/applicants) — note ESP restructured in Nov
2025 into Wishlist + RFP pathways; applications are rolling but must align
with an active Wishlist area or RFP, so position Snag as public-goods
payment infrastructure and check the current Wishlist before applying.
Also Optimism Retro Funding (retroactive public goods funding) — note this is
**paused since Jan 8, 2026 for at least 12 months**, with no missions planned
through Season 10 and 0 OP budgeted for Retro Funding in Year 5. Earliest
re-evaluation is ~Jan 2027, and the reserved allocation may be reallocated by
governance. So treat it as a possibility for much later, not as part of the
2026 plan — but still worth building the evidence trail now (retro funding
rewards demonstrated impact when it resumes).

## What Divine must do personally (Sincere cannot do these)

- [ ] Register the Snag project on Gitcoin **Builder** (the project registry)
      at https://grants.gitcoin.co (connect a wallet) — one-time setup now;
      the actual round application happens when a round opens
- [ ] Push the Snag code to a **public GitHub repo** under Divine's account
      (timestamped commit history = authorship proof)
- [ ] Fill in `[FILL IN]` fields below (Twitter/X handle, repo URL, demo link)
- [ ] Share the round with community when the donation window opens —
      quadratic funding rewards *many small donors*, so Divine's network matters
- [ ] Set up Gitcoin Passport (sybil resistance) for the project wallet

---

## Copy-paste answers

### Project name
Snag

### Tagline (one line)
Every send gives a little. You pick the cause.

### Short description (~50 words)
Snag is the first frictionless way to give with crypto. When you send ETH or
BTC through Snag, you opt in once and 1% of the send is automatically routed
to a charity wallet you choose — no separate donation step, no new token to
buy, no platform taking a cut. Created by Divine.

### Long description (~200 words)
Crypto moves billions every day, yet giving remains a separate, forgettable
chore: open another app, find a cause, pay again, pay a processor's fee.
Snag puts the gift *inside* the payment. Send ETH through the SnagRouter
smart contract (or BTC via a charity-output PSBT your own wallet signs),
pick one of 8 specific causes — diapers for low-income families, utility
bills for single mothers, groceries, school supplies, medical relief,
shelter, clean water, disaster response — and 1% of your send routes
automatically to that cause's wallet. The other 99% goes exactly where you
addressed it.

Snag is strictly opt-in and non-custodial: nothing is ever taken from a
wallet that doesn't choose it, no private keys leave the user's wallet, and
every snag is verifiable on-chain. The contracts are open source, the fee is
capped at 10% in-contract (currently set to 1%), and 100% of the snag reaches
the chosen cause — compare ~2.5% processor fees elsewhere.

This is public-goods infrastructure: anyone can integrate it, fork it, or
build on it. Created by Divine.

### Why is this a public good?
Open-source, non-excludable, non-rivalrous charitable infrastructure. Snag
doesn't capture value — it routes value to causes. Any wallet, app, or
protocol can integrate the router or PSBT builder. The code, cause wallets,
and all snag events are public and verifiable on-chain.

### Roadmap / milestones (what the grant funds)
1. **Security review + testnet hardening** — third-party review of
   SnagRouterMulti, expanded test coverage, Sepolia end-to-end tests.
2. **Mainnet deployment** — deploy, register 8 cause wallets, verify source
   on Etherscan, first real mainnet snags.
3. **Wallet integration kit** — drop-in JS/TS SDK + docs so any wallet or
   app can offer "Send with Snag" in one integration.
4. **Transparency dashboard** — public page tracking total snagged per cause,
   per chain, over time (indexed from on-chain events).

### Funding ask & allocation
Ask: **[FILL IN — e.g. $25,000]** to cover:
- ~40% security review & audit preparation
- ~25% mainnet deployment costs & gas
- ~25% SDK + dashboard development
- ~10% documentation & community

### Team
**Divine** — creator and lead. Conceived Snag, defined the 1% opt-in model
and the 8 launch causes, directed the prototype build (contracts, Bitcoin
tooling, demo).

### Links
- Website/demo: [FILL IN — demo page link]
- GitHub: [FILL IN — public repo URL]
- Whitepaper: included in repo (`WHITEPAPER.md`)
- Twitter/X: [FILL IN — Divine's handle]

---

## Quadratic funding strategy notes (for Divine)

- **Many small donors beat few large ones.** Ask 200 people for $2, not 2
  people for $200. The matching formula amplifies breadth.
- **Tell the story, not the tech.** "Your everyday crypto sends fund
  diapers and utility bills" beats "PSBT charity outputs."
- **Post during the donation window**, not before — attention must convert
  to donations inside the window.
- **Thank donors publicly** and show the dashboard once snags start flowing;
  Optimism Retro Funding is paused until at least Jan 2027, but if/when it
  resumes it rewards demonstrated impact, so start the evidence trail now.
