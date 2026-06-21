# Promotions Aggregator

Single-mall MVP that scrapes promotions from [The Promenade Shops at Briargate](https://www.thepromenadeshopsatbriargate.com/sales), stores them in SQLite, exposes a typed REST API, and renders a browsable dashboard.

## Prerequisites

- [Bun](https://bun.sh) 1.1+ (or Node.js 20+)
- [Docker](https://www.docker.com/) (optional, for one-command startup)

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- UI: http://localhost:3000/dashboard
- API: http://localhost:3001

## Local development

### 1. Environment

```bash
cp .env.example .env
```

### 2. Backend

```bash
cd backend
bun install
bun run dev
```

API runs at http://localhost:3001

### 3. Frontend

```bash
cd app
bun install
bun run dev
```

UI runs at http://localhost:3000

## Trigger a scrape

**Via UI:** open the dashboard and click **Run Scrape**.

**Via API:**

```bash
curl -X POST http://localhost:3001/scrape
# => { "success": true, "data": { "jobId": "..." } }

curl http://localhost:3001/scrape/<jobId>
```

Poll until `status` is `done` or `failed`, then browse results:

```bash
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
# Backend typecheck
cd backend && bun run typecheck

# Frontend lint + build
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

## Known limitations

- Single portal only (hard-coded URL)
- No authentication (local open API)
- Scrape runs sequentially with ~500 ms delay between requests
- Promotions removed from the source site are retained in the DB (upsert-only)
- Docker frontend uses `localhost:3001` for API calls from the browser

## Documentation

- [DESIGN.md](./DESIGN.md) — schema, scraping approach, async jobs
- [ASSUMPTIONS.md](./ASSUMPTIONS.md) — date parsing, dedup keys, missing data
