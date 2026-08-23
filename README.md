# CompyDex v28 — Shared USD Market History

CompyDex now has the zero-cost foundation for a shared USD price-history database.

## What changed

- Records one TCGplayer USD market snapshot per card, finish, and day.
- Shares history through a Cloudflare D1 database instead of keeping it only on one phone.
- Keeps the existing local history as an automatic fallback until D1 is connected.
- Preserves the current analytics UI and waits for two genuine daily snapshots before drawing a chart.
- Does not require a paid sold-comps or historical-price API.

## Files to upload

Upload and overwrite the complete package, including:

- `app.js`
- `index.html`
- `service-worker.js`
- `styles.css`
- `functions/api/market-history.js`
- `schema.sql`

Keep the existing `functions`, `assets`, manifest, icons, and offline page included in this package.

## Cloudflare D1 setup

1. In Cloudflare, create a D1 database named `compydex-market`.
2. Open its Console and run the contents of `schema.sql` once.
3. In the CompyDex Pages project, add a D1 binding:
   - Variable name: `MARKET_DB`
   - D1 database: `compydex-market`
4. Redeploy the project.

If the binding is not connected yet, CompyDex continues using the phone's existing local history without breaking card search or pricing.

## Commit

Title: `CompyDex v28`

Extended description:

`Add Cloudflare D1-ready shared USD market snapshots by card and finish, retain local history as a graceful fallback, and prepare CompyDex to build its own 90-day price charts without a paid history provider.`
