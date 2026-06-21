# Promotions Aggregator

Single-mall MVP that scrapes promotions from [The Promenade Shops at Briargate](https://www.thepromenadeshopsatbriargate.com/sales), stores them in SQLite, exposes a typed REST API, and renders a browsable dashboard.

## Prerequisites

- [Bun](https://bun.sh) 1.1+
- [Node.js](https://nodejs.org/) 20+ (backend runs via `tsx` on Node for `better-sqlite3`)

## Setup

```bash
cp .env.example .env
```

### Backend

```bash
cd backend
bun install
bun run dev
```

API: http://localhost:3001

### Frontend

```bash
cd app
bun install
bun run dev
```

UI: http://localhost:3000/dashboard

## Build for production

```bash
# Backend — compile TypeScript
cd backend && bun run build

# Frontend — Next.js production build
cd app && bun run build && bun run start
```

## Trigger a scrape

**Via UI:** open the dashboard and click **Run Scrape**.

**Via API:**

```bash
curl -X POST http://localhost:3001/scrape
curl http://localhost:3001/scrape/<jobId>
curl "http://localhost:3001/promotions?page=1&pageSize=10"
curl http://localhost:3001/brands
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/promotions` | Paginated list (`search`, `startDate`, `endDate`, `brand`, `page`, `pageSize`) |
| GET | `/promotions/:id` | Single promotion |
| GET | `/brands` | Brands with metadata and promotion counts |
| POST | `/scrape` | Start async scrape (returns `202` + `jobId`) |
| GET | `/scrape/:jobId` | Scrape job status |

## Scripts

```bash
cd backend && bun run typecheck
cd app && bun run lint && bun run build
```

## Project structure

```
types/          Shared TypeScript contracts (scraper → API → UI)
backend/        Express API + scraper + SQLite
app/            Next.js dashboard (shadcn/ui)
DESIGN.md       Architecture and trade-offs
ASSUMPTIONS.md  Interpretations of ambiguous requirements
```

## Documentation

- [DESIGN.md](./DESIGN.md) — schema, scraping approach, async jobs
- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — date parsing, dedup keys, missing data
