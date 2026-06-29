# World Bull Cup — Developer Brief

**Version:** 0.1 (prototype handoff)
**Stack:** React (single-file component, inline styles + one `<style>` block for fonts/keyframes/hover)
**Status:** UI complete with dummy data. Live data path stubbed and ready to wire.

---

## 1. What this is

A sportsbook-styled "versus" board for meme coins. Each player coin (Lionel Bull, Kylian Bull, Cristiano Bull) is presented in head-to-head matchups with "odds." The visual language is betting/odds, but the engine only **compares market caps** — there is no wager, no stake, no payout.

**This is critical and non-negotiable:** nothing on this site is real betting. "Odds" are a visual reading of each coin's share of the combined market cap. The disclaimers in the hero and footer must stay. Do not add any feature that takes user funds, holds a pot, or pays out a result.

---

## 2. Core mechanic — how "odds" work

Odds are derived, not set by anyone.

```
share(player)  = player.marketCap / sum(all marketCaps)
odds(player)   = 1 / share(player)        // rounded to 2 decimals
```

- Higher market cap → larger share → **lower odds** → shown as the favorite (gold star, gold odds figure).
- The "VERSUS" momentum bar splits two players by their relative market-cap share within that pair.
- Everything recomputes automatically from the `marketCap` values. No odds are hardcoded.

---

## 3. Data model

Single source of truth is the `INITIAL_PLAYERS` array at the top of the file. The entire UI scales off it — add an object, and the board, the versus matchups, and the favorite logic all update.

```js
{
  id: "lionel",            // unique slug
  name: "Lionel Bull",
  nation: "Argentina",
  flag: "🇦🇷",
  ticker: "LIOBULL",
  accent: "#5BA3D0",       // per-player color (used in avatar border + momentum bar)
  contract: "Soon",        // mint address when live
  pairAddress: "",         // DexScreener Solana pair address — REQUIRED for live data
  img: "",                 // bull artwork: data URL, /public path, or https URL
  // dummy fallbacks (used only when USE_LIVE_DATA = false):
  marketCap: 4_120_000,
  price: 0.00412,
  volume24h: 980_000,
  change24h: 12.4,
}
```

**To add a 4th+ player:** append an object with a unique `id`. The versus section auto-generates every unique pair, so 3 players → 3 matchups, 4 players → 6 matchups, etc. Watch the count if the roster grows large.

---

## 4. Wiring live data

Two steps:

1. Fill in each player's `pairAddress` (the Solana pool address from DexScreener).
2. Set `USE_LIVE_DATA = true` (top of file).

The `fetchLiveData()` function is already written. It:
- Hits `https://api.dexscreener.com/latest/dex/pairs/solana/{pairAddress}` (public, no API key).
- Maps `marketCap` / `fdv`, `priceUsd`, `volume.h24`, `priceChange.h24` onto each player.
- On failure for any coin, leaves that coin's dummy values in place (no crash).
- Auto-refreshes every 30 seconds via `setInterval`, plus a manual "↻ refresh" button on the board.

**Edge cases to handle before launch:**
- A coin with no pair yet (pre-launch) — currently skipped; decide whether to show "—" or hide the row.
- DexScreener response shape varies (`data.pairs[0]` vs `data.pair`) — both are already handled, but verify against a real live pair.
- Rate limits — 30s interval is conservative; don't lower it aggressively if the roster is large.

---

## 5. Page structure

| Section | Component | Notes |
|---|---|---|
| Nav | `Nav` | Sticky, blurred. Mobile hides text links, keeps the Trade CTA. |
| Hero | `Hero` | Thesis headline, combined market cap, current favorite, live disclaimer. |
| Odds Board | `Board` | One row per player, sorted by market cap. Favorite gets a star + gold odds. Per-row "Trade" link. |
| Versus | `Versus` | **Signature element.** Auto-generated pairwise matchups with a momentum bar that animates to each side's share. Leader tagged "FRONT RUNNER." |
| Fixtures | `Schedule` | Knockout-only schedule (Round of 16 → Final). Placeholder dates/matchups. |
| Footer | `Footer` | Full legal disclaimer + social links. |

> **Note:** the group-stage fixtures were intentionally removed. Schedule now runs knockout rounds only.

---

## 6. Placeholder content to replace before launch

- **Player artwork** — every `img` is empty; a bull-glyph placeholder shows instead. Drop in the edited images.
- **Contract / mint addresses** — all `"Soon"`.
- **Trade links** — every "Trade" button and the nav CTA point to `#`. Wire to the real Pump.fun pages.
- **Footer social links** — X, DexScreener, Pump.fun all point to `#`.
- **Fixture dates and matchups** — placeholders; confirm against the real campaign.
- **Dummy market figures** — replace via the live-data wiring above.

---

## 7. Design system (for consistency if extending)

- **Background:** `#0A0A0B` base, `#141416` cards, `#1B1B1E` hover, `#2A2A2E` lines.
- **Accent:** gold `#C9A227` — used sparingly, only for the favorite, gold odds, kickers, and CTAs. Do not spread it.
- **Up/down:** green `#4FB477` / red `#C0392B` for 24h change only.
- **Type:** Oswald (display — headlines, names, the "VS" badge), Inter (body), JetBrains Mono (all numbers — market cap, odds, prices; tabular figures).
- **Motion:** hero fade-up on load, momentum bars animate width on data change, hover micro-interactions. All wrapped in a `prefers-reduced-motion` guard — keep it.

---

## 8. Quality floor (already met — keep it)

- Responsive to mobile (board header collapses, nav links hide).
- Keyboard-focusable links/buttons.
- `prefers-reduced-motion` respected.
- No `localStorage`/`sessionStorage` (not supported in the render environment — keep all state in React).

---

## 9. Suggested next features (not yet built)

Pick per priority:

- **Tournament bracket** — a real 8/16-coin elimination tree with a visual path to the final.
- **Countdown timer** — to the next fixture or to launch.
- **Ticker animation** — numbers tick/flash on update for a live-trading feel.
- **Anthem player** — embedded World Cup songs, like the reference site.
- **Per-coin detail page** — chart embed (DexScreener iframe), holders, links.

---

## 10. Legal / compliance reminders

- Keep the "not betting / not financial advice / odds are a market-cap reading" language in both hero and footer.
- Keep the "independent fan project — not affiliated with FIFA, any player, federation, or Pump.fun" disclaimer.
- Do not implement anything that accepts deposits, escrows funds, or distributes winnings. That converts the site into regulated gambling.
