# Make everything real — no hardcoded data

Scope: replace mock market data with live prices, add real logos, persist buy/sell to the database so the portfolio reflects the user's actual holdings, and fix the placeholder/validation issues.

## 1. Live market data + real logos

Add a live data layer (no API key needed):
- **Crypto** — CoinGecko public API (`/api/v3/coins/markets`). Returns price, 24h change, market cap, and a real logo image URL for each coin.
- **Stocks / ETFs** — Yahoo Finance public quote endpoint (`query1.finance.yahoo.com/v8/finance/quote`) proxied through a TanStack server function to avoid CORS. Returns price, day change %, market cap. Logos from `logo.clearbit.com/<domain>` (Apple → apple.com, etc.) with a hard-coded symbol→domain map.

Wrap both in React Query hooks (`useCryptoQuotes`, `useStockQuotes`) with a 60s stale time. Replace all `ASSETS`/`findAsset` reads across dashboard, markets, watchlist, search, asset detail, buy, sell, portfolio.

Historical charts: Yahoo `chart` endpoint per range (1D/1W/1M/3M/1Y/ALL) for stocks; CoinGecko `market_chart` for crypto. Replaces `seriesFor` mock series.

Update `AssetIcon` to render the real logo image, falling back to the initial-letter tile only when the image fails to load.

## 2. Real portfolio from the database

New `holdings` table: `user_id, symbol, quantity` (unique per user+symbol) with RLS + GRANTs. New `useHoldings()` hook.

Portfolio page:
- Total value = cash balance + Σ(holding.quantity × live price)
- Stocks/Crypto buckets computed from live prices
- Past-month change computed from real transactions (removes the hard-coded `+$1,345.67 (2.78%)` and `cash 782.99`)
- Holdings list = actual rows from `holdings`, not `PORTFOLIO_HOLDINGS`

Delete the `PORTFOLIO_HOLDINGS` constant.

## 3. Buy / Sell in minutes

`useBuy` mutation (single DB round-trip via server function):
1. Validate amount > 0 and buying_power ≥ total
2. Insert `orders` row (status = `filled`)
3. Upsert `holdings` (increment quantity)
4. Decrement `accounts.buying_power` and `accounts.balance`
5. Insert `transactions` row (kind = `trade`)
6. Insert notification

`useSell` mutation: reverse — verify holding ≥ qty, decrement holding (delete row if 0), credit balance, log order + transaction + notification.

Both hooks invalidate `account`, `holdings`, `transactions`, `orders`, `notifications`. Buy/Sell screens show a spinner then redirect to `/orders` on success and a toast on error.

## 4. Fix forms & validation

**Account page**: remove `placeholder` on phone and address; replace country text input with a `<select>` of ~200 countries (single constant list in `src/lib/countries.ts`). Phone uses a proper `tel` input with format hint via label, not placeholder.

**Crypto deposit — step 2 "Continue"**: disable button when amount is empty/0/below the network `min`. Show inline validation message.

**Buy / Sell screens**: also disable Continue when amount ≤ 0 (already partial — tighten and show why).

## 5. Cleanups

- Search: "Recent" list backed by real user history (last 5 unique symbols from `transactions`), "Trending" from top-movers by absolute change.
- Dashboard: portfolio total from live prices + holdings (not just cash balance); today's change derived from real trades + intraday price delta.
- Watchlist "Add" button wired to a real `watchlist` table (or noted as follow-up if time-constrained).

## Technical notes

- Server functions: `src/lib/quotes.functions.ts` for Yahoo proxy (CORS + rate control), `src/lib/trade.functions.ts` for buy/sell (uses `requireSupabaseAuth`).
- CoinGecko is called directly from the client (CORS-enabled).
- New migration: `holdings` table + optional `watchlist` table with GRANTs and RLS.
- No changes to auth, routing shell, or design tokens.

## Out of scope (flag for follow-up)

- Real-time streaming prices (poll every 60s is enough for a demo)
- Order types beyond market (no limit/stop)
- Fractional-share regulatory checks
