# Assumptions

Interpretations and decisions for anything ambiguous in the brief or source site.

## Scope

- **Single portal only** — hard-coded to [The Promenade Shops at Briargate](https://www.thepromenadeshopsatbriargate.com/sales). No multi-mall abstraction.
- **No authentication** — the API is open on localhost, per the take-home non-goals.
- **Dashboard only** — no login/register pages; the UI is a single promotions dashboard.

## Source site

- HTML is server-rendered, so **Axios + Cheerio** is enough (no headless browser).
- Promotions live on `/sales` in three sections, identified by `data-collection-id`:
  - `1013480` → `deals`
  - `1013483` → `style_notes`
  - `1013481` → `new_arrivals`
- Brand metadata (hours, website, phone, logo, description) lives on **store pages** (`/stores/{id}-{slug}/`), not on the sales listing. We fetch each store page once and link it to promotions via the store URL from the deal detail page.
- **Social links** are taken from store pages where available. Share buttons on deal pages (Facebook/Twitter share URLs) are not treated as brand social profiles.
- Some brands may not have a website, hours, or socials — that is expected.

## Identifiers and re-scraping

- **Promotion `uniqueId`** = normalized brand name + deal path with slashes replaced by underscores  
  e.g. `bath_and_body_works_deals_3251680`
- **Brand `uniqueId`** = store ID + slug from the store URL  
  e.g. `1036000_bath_and_body_works`
- Brand names used in IDs are lowercased, special characters removed, spaces/hyphens become underscores.
- Re-scrapes **upsert** on `uniqueId` — existing records update, new ones insert. Promotions that disappear from the site are **not deleted** (kept in the DB to avoid losing data on temporary removals).

## Dates

- "Ends Today" → today's date; "Ends Tomorrow" → tomorrow's date, relative to **scrape time in the server timezone**.
- If text parsing fails, we fall back to `data-end` (Excel serial) from the listing row.
- If both fail, `endDate` is `null`. Start date comes from `data-start` when present, otherwise `null`.
- All dates are stored and returned as ISO `YYYY-MM-DD`.

## Missing data

- Unavailable scalar fields → `null`
- Unavailable arrays (tags, hours, social links) → `[]`
- Failed records are logged and counted in the scrape job summary — they are not silently dropped.

## Scraping behaviour

- Requests are **sequential** with a ~500 ms delay between them, a browser-like User-Agent, and a 15 s timeout.
- Only the sales listing, deal detail pages, and linked store pages are fetched — no full-site crawl.
- If a detail or store page fails, we keep whatever data was collected from earlier steps and move on.

## API and jobs

- Endpoints match the brief: `/promotions`, `/brands`, `/scrape`, `/scrape/:jobId` — no `/api` prefix.
- `POST /scrape` returns `202` immediately; scraping runs in the background.
- **One scrape at a time** — a second request while a job is running returns `409 Conflict`.
- Pagination applies only to `GET /promotions` (default `page=1`, `pageSize=20`).

## UI

- Search matches promotion name and brand name.
- Date filters apply to `endDate`.
- Group-by-brand view reads from the same data; brand headers show website, hours, and social links where scraped.
