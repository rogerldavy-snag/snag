# Snag — Auditor Outreach

Send to 2–3 firms, compare quotes. Firms respond on business days;
sending on a weekend is fine, expect replies Monday+.

## Channels

1. **OpenZeppelin** — https://www.openzeppelin.com/request (audit request form)
2. **Cyfrin** — https://www.cyfrin.io/get-an-audit → Typeform (https://cyfrin.typeform.com/contact-expert), 9 questions, ~1 min. NOTE 2026-10-17: sales@cyfrin.io BOUNCED — do not use; the Typeform is the working channel.
3. **Trail of Bits** — two channels:
   - Email: **info@trailofbits.com** (published in their own audit reports' contact boilerplate; try this first, same template, greeting "Hi Trail of Bits team,"). Unlike Cyfrin's dead sales@ address this one is their general intake — but if it bounces, fall back to the form.
   - Contact form: https://trailofbits.com/contact/ (JS form — paste the email body into the message field)

   NOTE 2026-10-18: Trail of Bits typically engages established/enterprise clients, so frame Snag as audited-ready open-source infrastructure (18 tests, Sepolia deployment, frozen scope doc) — exactly what the template does. A standalone quote still lets you compare against the Arbitrum/EF subsidy offers.

Also already in flight: Arbitrum Audit Program application, EF $1M Security
Subsidy via Areta (November cohort). A standalone quote lets Divine compare
against whatever the subsidy programs offer.

## Email template (copy-paste, fill the [brackets])

Subject: Audit quote request — Snag (158 LOC, 2 Solidity contracts)

Hi [Firm] team,

I'm Divine, solo builder of Snag — open-source infrastructure for
frictionless crypto giving (opt-in 1% fee on ETH sends, routed automatically
to charity wallets the sender picks; MIT-licensed, no token).

I'd like a quote for a smart contract audit:

**Scope:** 2 contracts, 158 lines total
- SnagRouterMulti.sol (66 lines) — multi-cause payment router
- SnagRouter.sol (92 lines) — single-cause router + ERC20 variant

**Audit readiness:** 18-test Hardhat suite (all passing), written scope doc
with invariants and disclosed considerations, deployed and end-to-end tested
on Sepolia testnet. Code frozen at commit 83887e2.

**Links:**
- Repo: https://github.com/rogerldavy-snag/snag
- Scope doc: https://github.com/rogerldavy-snag/snag/blob/main/audits/PREP.md
- Sepolia deployment: https://sepolia.etherscan.io/address/0x02Fad5B35aA4c73385cA166Edb3Da9ae9EC0b520

**Timeline:** aiming to start within 4–8 weeks.

Could you share a quote and earliest availability? I'm also exploring audit
subsidy programs (Arbitrum Audit Program, EF Security Subsidy via Areta), so
a standalone quote helps me compare options.

Thanks,
Divine
https://x.com/DivineDavy
