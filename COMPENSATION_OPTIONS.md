# Snag — Compensation Model Options

Divine wants two things: **public credit for the idea** and **some form of compensation**. Below are honest, practical options — no model guarantees income, and any model involving fees on charitable giving needs trust and real transaction volume to work.

---

## Option A — Small transparent builder fee (e.g. 0.1–0.2% on top of the 1%)

Take a tiny, publicly disclosed cut — say 0.1% — alongside the 1% charity snag. Every user sees exactly where every basis point goes.

**Pros:** Sustainable if volume grows; aligned incentives (you earn when giving happens); simple to implement in the contracts.
**Cons:** "Fee on charity" is a sensitive look — even 0.1% will draw criticism; requires extra trust and crystal-clear disclosure; meaningful income needs large volume (0.1% of $1M in sends = $1,000).

## Option B — Voluntary "tip the builder"

No mandatory fee. After each snag, users get an optional one-tap tip to Divine (suggested: a few cents or a % they choose).

**Pros:** Cleanest optics — charity stays 100% pure; goodwill-driven; zero trust concerns.
**Cons:** Tips are unreliable income; most users won't tip; still needs volume and a smooth UX to convert at all.

## Option C — Snag token / points for givers

Issue a token or non-transferable points rewarding people who give through Snag (e.g. 1 point per $1 snagged). Could later carry perks, governance, or market value.

**Pros:** Can create community and virality; rewards givers, not just the builder.
**Cons:** **High risk.** A tradable token invites speculation, regulatory scrutiny (securities law), and reputational damage if the price collapses — the opposite of what a charity project needs. Points (non-transferable) are safer than a token but still add complexity. Do not launch a token lightly.

## Option D — Grants and charity-tech funding

Apply for ecosystem grants (e.g. Ethereum Foundation public goods funding, Gitcoin rounds, Optimism RetroPGF) and philanthropy-tech grants aimed at charitable infrastructure.

**Pros:** No fees taken from donations at all; grant funders *want* to fund exactly this kind of public good; Gitcoin-style quadratic funding rewards community support.
**Cons:** Competitive and slow; grant-sized money is lumpy, not recurring; requires writing applications and reporting.

## Option E — Pure nonprofit + paid custom deployments

Keep Snag itself fee-free and nonprofit. Monetize Divine's expertise: charge charities, DAOs, or companies for custom Snag deployments, white-label integrations, and support.

**Pros:** Strongest trust story ("100% goes to charity, always"); consulting revenue doesn't depend on Snag's transaction volume; positions Divine as the go-to builder in crypto-philanthropy.
**Cons:** Income depends on finding clients; slower to start; splits focus between product and services.

---

## Recommendation

**Start with B + D: voluntary tips plus grants.**

Why: Snag's entire value proposition is trust — "your 1% goes exactly where you chose." Any mandatory builder fee, however small, muddies that story at launch when trust is thinnest. Voluntary tips keep the product pure while leaving the door open for supporter income, and grants (especially Gitcoin / RetroPGF-style public goods funding) are literally designed for projects like this. Revisit Option A only after Snag has real volume and a track record — a disclosed 0.1% is far more defensible once thousands of users already trust the system. Avoid Option C (token) until there is a compelling, non-speculative reason for it.

---

## Staying publicly credited as the creator

Credit is cheap to secure and hard to steal if you set it up early:

1. **Contract deployer address** — Deploy SnagRouter contracts from a wallet publicly linked to Divine. The deployer is permanently on-chain.
2. **Code comments + NatSpec** — Put "Created by Divine" in the contract headers and README. On-chain and in-repo attribution.
3. **GitHub history** — Keep the repo public with Divine as the original committer; commit history is timestamped proof of authorship.
4. **Whitepaper / docs attribution** — A short `WHITEPAPER.md` or docs page with "Snag was created by Divine (date)" establishes the narrative in your words.
5. **ENS name** — Register something like `divine.eth` (or `snag.eth`) and use it as the deployer/owner address. Human-readable, hard to fake.
6. **Social timestamp** — The promo drafts in `PROMO_DRAFTS.md`, once posted from Divine's accounts, create public, timestamped claims of authorship.

Do these *before* seeking funding or partners — they make the credit story unambiguous from day one.

---

## Honest caveats

- **No model guarantees income.** Charity infrastructure is a volume game; without meaningful transaction flow, fees and tips round to zero.
- **Trust is the product.** One undisclosed fee or one mishandled wallet destroys everything. Disclose every basis point, keep charity keys secure, and never move charity funds for any reason.
- **Volume comes from distribution**, not code. The contracts are the easy part — getting wallets and apps to integrate Snag is the real work.
- **Talk to a lawyer** before taking any fee adjacent to charitable solicitation; rules vary by jurisdiction and "charity" language can trigger registration requirements.
