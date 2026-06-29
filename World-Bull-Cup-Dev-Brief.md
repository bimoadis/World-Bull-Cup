# World Bull Cup — Developer Brief

**Version:** 0.2 (three-championship build)
**Stack:** React (single-file component, inline styles + one `<style>` block for fonts/keyframes/hover)
**Status:** UI complete with dummy data. Market metrics wire to DexScreener; burn/holder metrics are on-chain/manual.

---

## 1. What this is

A sportsbook-styled site where one roster of player meme coins competes in **three parallel championships**, each ranking the same bulls by a different metric:

| Championship | Metric | Accent | Data source |
|---|---|---|---|
| **Who's the GOAT** | market cap | gold `#C9A227` | Live — DexScreener |
| **Burn Championship** | total tokens burned (absolute) | fire `#E8602C` | On-chain / manual |
| **Holder Championship** | holder count | blue `#4F8FE8` | On-chain / manual |

The visual language is betting/odds, but the engine only **compares a metric across coins**. There is no wager, no stake, no payout.

**Non-negotiable:** nothing here is real betting. "Odds" are a visual reading of each coin's share of the metric being compared. The disclaimers in the hero and footer must stay. Never add a feature that takes user funds, holds a pot, or pays out a result — that converts the site into regulated gambling.

---

## 2. Core mechanic — odds, per championship

Each championship computes independently off its own metric:

```
share(player)  = player[metric] / sum(all player[metric])
odds(player)   = 1 / share(player)        // rounded to 2 decimals
```

- Highest metric value → largest share → lowest odds → favorite (accent-colored star + odds figure).
- The versus momentum bar within each section splits a pair by their relative share of THAT section's metric.
- Nothing is hardcoded — change a roster number and every board, every matchup, every odds figure recomputes.

---

## 3. Data model

Single source of truth: `INITIAL_PLAYERS` at the top of the file.

```js
{
  id: "lionel",            // unique slug
  name: "Lionel Bull",
  nation: "Argentina",
  flag: "🇦🇷",
  ticker: "LIOBULL",
  accent: "#5BA3D0",       // per-player color (avatar border + that player's momentum fill)
  contract: "Soon",        // mint address when live
  pairAddress: "",         // DexScreener Solana pair address — REQUIRED for live market data
  img: "",                 // bull artwork: data URL, /public path, or https URL

  // DexScreener metrics (auto when live):
  marketCap: 4_120_000,
  price: 0.00412,
  volume24h: 980_000,
  change24h: 12.4,

  // On-chain / manual metrics — NOT from DexScreener:
  tokensBurned: 182_000_000,   // absolute count sent to the burn address
  holders: 14_200,
}
```

**Add a player:** append an object with a unique `id`. All three championships, their boards, and their versus grids update automatically. Each section auto-generates every unique pair (3 players → 3 matchups, 4 → 6, etc.).

---

## 4. Championship config

Championships are defined in the `CHAMPIONSHIPS` array — this is what makes them easy to edit or extend:

```js
{
  id: "burn",
  kicker: "Championship II",
  title: "BURN CHAMPIONSHIP",
  blurb: "…",
  metric: "tokensBurned",   // which roster field to rank by
  accent: FIRE,             // section theme color
  format: (n) => fmtCount(n),
  unit: "tokens burned",
  source: "On-chain · burn address",
}
```

- **To add a 4th championship** (e.g. Volume Cup, Momentum Cup): push one object here pointing at an existing roster field (`volume24h`, `change24h`). No other code changes needed.
- **To reorder sections:** reorder this array. Background alternates light/dark automatically.

---

## 5. Wiring data

### Market metrics (GOAT) — DexScreener, automatic
1. Fill each player's `pairAddress` (Solana pool address).
2. Set `USE_LIVE_DATA = true`.
3. `fetchLiveData()` is ready — public API, no key, refreshes every 30s plus a manual refresh button. On per-coin failure it keeps existing values.

### Burn + Holder metrics — on-chain or manual
These do **not** come from DexScreener. Options:
- **Manual:** edit `tokensBurned` / `holders` in the roster (simplest; fine for periodic updates).
- **On-chain:** add a fetcher that reads the burn-address balance and holder count (e.g. via a Solana RPC or an indexer like Helius), then merge into player state the same way `fetchLiveData` does. Stub a `fetchOnchainData()` alongside the existing fetcher and call it from `refresh()`.

> **Heads-up on the burn metric:** it's currently an **absolute** token count. Because coins can have different supplies, the coin with the largest initial supply will tend to win regardless of effort — the leaderboard may be predictable. If that becomes a problem, switch `metric` to a derived "% of supply burned": add a `format` that shows a percentage and change the metric to a function of `tokensBurned / initialSupply`. The UI doesn't care which you choose.

---

## 6. Page structure

Nav → Hero → meta/refresh bar → **GOAT** → **Burn** → **Holder** → Fixtures → Footer.

Each championship section contains: themed header (kicker + title + blurb + data-source chip), a ranked odds board, and a "Head to head" versus grid of pairwise matchups with animated momentum bars. Sections alternate background (light/dark) for separation.

> Group-stage fixtures were removed earlier — schedule is knockout-only (Round of 16 → Final).

---

## 7. Placeholder content to replace before launch

- **Player artwork** — every `img` is empty; a bull-glyph placeholder shows instead.
- **Contract / mint addresses** — all `"Soon"`.
- **Trade links** — every "Trade" button and the nav CTA point to `#`. Wire to real Pump.fun pages.
- **Footer social links** — X, DexScreener, Pump.fun all `#`.
- **Fixture dates/matchups** — placeholders.
- **All dummy figures** — market via live wiring; burn/holder via manual or on-chain.

---

## 8. Design system

- **Background:** `#0A0A0B` base, `#141416` cards, `#1B1B1E` hover, `#2A2A2E` lines.
- **Championship accents:** gold `#C9A227` (GOAT), fire `#E8602C` (Burn), blue `#4F8FE8` (Holder). Each section themes its kicker, rule, star, favorite odds, lead tag, and Trade-hover via a `--accent` CSS variable set inline on the section.
- **Per-player accent:** each player keeps their own color for avatar borders and their momentum-bar fill, so you can tell who's who across all three boards.
- **Type:** Oswald (display), Inter (body), JetBrains Mono (all numbers, tabular).
- **Motion:** hero fade-up, momentum bars animate width on data change, hover micro-interactions — all under a `prefers-reduced-motion` guard.

---

## 9. Quality floor (keep it)

- Responsive to mobile (board headers collapse, nav links hide).
- Keyboard-focusable controls.
- `prefers-reduced-motion` respected.
- No `localStorage`/`sessionStorage` (unsupported in the render environment — keep state in React).

---

## 10. Suggested next features

- 4th championship (Volume Cup / Momentum Cup) — trivial via the `CHAMPIONSHIPS` array, data already present.
- Tournament bracket — real elimination tree to the final.
- Countdown timer to next fixture / launch.
- Number ticker/flash on update for live-trading feel.
- Per-coin detail page (DexScreener chart embed, links).
- Anthem player, like the reference site.

---

## 11. Legal / compliance

- Keep "not betting / not financial advice / odds are a metric reading" in hero and footer.
- Keep "independent fan project — not affiliated with FIFA, any player, federation, or Pump.fun."
- Do not implement deposits, escrow, or payouts.
