# Promotions Aggregator

Single-mall MVP that scrapes promotions from [The Promenade Shops at Briargate](https://www.thepromenadeshopsatbriargate.com/sales), stores them in SQLite, exposes a typed REST API with real-time scrape updates over Socket.IO, and renders a browsable dashboard.

## Prerequisites

- [Bun](https://bun.sh) 1.1+
- [Node.js](https://nodejs.org/) 20+ (backend runs via `tsx` on Node for `better-sqlite3`)

## Setup

### Backend

```bash
cd backend
cp .env.example .env
bun install
bun run dev
```

API: http://localhost:3001

### Frontend

```bash
cd app
cp .env.example .env.local
bun install
bun run dev
```

UI: http://localhost:3000/dashboard

See each project's `.env.example` for optional configuration. Defaults work for local development without any changes.

## Build for production

```bash
# Backend — compile TypeScript
cd backend && bun run build

# Frontend — Next.js production build
cd app && bun run build && bun run start
```

Set `NODE_ENV=production` on the backend for combined HTTP logs. Point `NEXT_PUBLIC_API_URL` at your deployed API URL before building the frontend.

## Trigger a scrape

**Via UI:** open the dashboard and click **Run Scrape**. Progress and completion are pushed over Socket.IO; Sonner toasts appear when scrapes start, finish, or fail.

**Via API:**

```bash
curl -X POST http://localhost:3001/scrape
curl http://localhost:3001/scrape/<jobId>
curl http://localhost:3001/scrape-sessions
curl "http://localhost:3001/promotions?page=1&pageSize=10&order_by=end_date"
curl "http://localhost:3001/brands?scrapeSessionId=<sessionId>"
```

Each scrape creates a new **scrape session** (`Scrape 1`, `Scrape 2`, …). Promotions are isolated per session so you can compare runs. Multiple scrapes may run concurrently.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/promotions` | Paginated list (`search`, `startDate`, `endDate`, `brand`, `scrapeSessionId`, `order_by`, `page`, `pageSize`) |
| GET | `/promotions/:id` | Single promotion |
| GET | `/brands` | Brands with metadata, promotion counts, and nested promotions (`scrapeSessionId` optional) |
| GET | `/scrape-sessions` | All scrape sessions |
| GET | `/scrape-sessions/:id` | Single scrape session |
| POST | `/scrape` | Start async scrape (returns `202` + `jobId`, `scrapeSessionId`, `sessionName`) |
| GET | `/scrape/:jobId` | Scrape job status |

### Sorting (`order_by`)

Default: `end_date` (ending soonest first). Prefix with `-` for descending.

| Value | Sorts by |
|-------|----------|
| `end_date`, `-end_date` | Expiry date |
| `name`, `-name` | Promotion name |
| `brand`, `-brand` | Brand name |
| `tags`, `-tags` | Collection tag |

### Socket.IO events

Connect to the same host as the API (`NEXT_PUBLIC_API_URL`). Events:

| Event | Description |
|-------|-------------|
| `scrape:active` | Active sessions on connect |
| `scrape:started` | Scrape job started |
| `scrape:progress` | Running counts (`recordsFound`, `recordsEnriched`, `recordsFailed`) |
| `scrape:completed` | Scrape finished successfully |
| `scrape:failed` | Scrape failed with error message |

## Dashboard features

- **List view** — sortable promotions table with search, date range, brand filter, scrape session selector, and pagination
- **Group by brand** — brand cards with nested promotions for the selected session
- **Active filters** — summary chips with one-click clear
- **Debounced filters** — search and brand inputs wait 300 ms before querying
- **Promotion detail** — dialog with full scraped fields and external deal link
- **Background scrapes** — banner and session dropdown show in-progress runs

Filter state is managed with Zustand (`app/stores/dashboard-filters.store.ts`).

## Scripts

```bash
cd backend && bun run typecheck
cd backend && bun run db:clear    # wipe SQLite data
cd app && bun run lint && bun run build
```

## Project structure

```
types/          Shared TypeScript contracts (scraper → API → UI)
backend/        Express API + scraper + SQLite + Socket.IO
app/            Next.js dashboard (shadcn/ui, React Query, Zustand)
DESIGN.md       Architecture and trade-offs
ASSUMPTIONS.md  Interpretations of ambiguous requirements
```

## Documentation

- [DESIGN.md](./DESIGN.md) — schema, scraping approach, real-time jobs, UI
- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — date parsing, dedup keys, missing data
