# Backend API Reference

Base URL (local): `http://localhost:3001`

All JSON responses use a shared envelope. Types live in the repo root `types/` folder.

---

## Response format

### Success

```json
{
  "success": true,
  "message": "Human-readable summary",
  "data": {},
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total": 42,
      "per_page": 20,
      "from": 1,
      "to": 20
    }
  }
}
```

`meta.pagination` is included only on paginated list endpoints (`GET /promotions`).

### Error

```json
{
  "success": false,
  "message": "What went wrong",
  "errors": ["Optional detail strings"]
}
```

Common status codes: `400` (validation), `404` (not found), `202` (scrape accepted).

---

## Data models

### Brand

Shared across scrape sessions. Metadata comes from store directory pages.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `uniqueId` | string | Stable key from store URL, e.g. `1036000_bath_and_body_works` |
| `name` | string | Display name |
| `websiteUrl` | string \| null | External retailer site |
| `hours` | `{ label, value }[]` | Store hours |
| `socialLinks` | `{ platform, url }[]` | Social profiles from store page |
| `phone` | string \| null | |
| `location` | string \| null | |
| `directoryMapUrl` | string \| null | Mall map link |
| `logoUrl` | string \| null | |
| `description` | string \| null | |
| `createdAt` | ISO datetime | |
| `updatedAt` | ISO datetime | |

### Promotion

Scoped to a scrape session. Each run creates a new session (`Scrape 1`, `Scrape 2`, …).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `uniqueId` | string | e.g. `bath_and_body_works_deals_3251680` |
| `scrapeSessionId` | UUID | Parent session |
| `brandId` | UUID | FK → Brand |
| `name` | string | Promotion title |
| `description` | string \| null | From deal detail page |
| `imageUrl` | string \| null | |
| `startDate` | `YYYY-MM-DD` \| null | |
| `endDate` | `YYYY-MM-DD` \| null | Expiry date |
| `tags` | string[] | `deals`, `style_notes`, or `new_arrivals` |
| `sourceUrl` | string | Deal URL on mall site |
| `sourcePortal` | string | `thepromenadeshopsatbriargate.com` |
| `scrapedAt` | ISO datetime | |
| `createdAt` | ISO datetime | |
| `updatedAt` | ISO datetime | |

List/detail promotion responses embed a `brand` object with the fields listed above (subset of Brand).

### Scrape session

One row per scrape run.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | |
| `name` | string | Auto-named `Scrape N` |
| `status` | string | `pending` \| `running` \| `done` \| `failed` |
| `recordsFound` | number | Listing items discovered |
| `recordsEnriched` | number | Successfully saved |
| `recordsFailed` | number | Failed detail/store steps |
| `error` | string \| null | Top-level failure message |
| `createdAt` | ISO datetime | |
| `updatedAt` | ISO datetime | |
| `promotionCount` | number | Optional, on session list |

### Scrape job

Per `POST /scrape` request. Linked to a scrape session.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Returned as `jobId` |
| `status` | string | Same enum as session |
| `recordsFound` | number | |
| `recordsEnriched` | number | |
| `recordsFailed` | number | |
| `error` | string \| null | |
| `createdAt` | ISO datetime | |
| `updatedAt` | ISO datetime | |

---

## Endpoints

### `GET /health`

Health check.

**Response `200`**

```json
{
  "success": true,
  "message": "OK"
}
```

---

### `GET /promotions`

Paginated promotions for a scrape session, with brand metadata joined.

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Matches promotion name or brand name |
| `startDate` | `YYYY-MM-DD` | — | Filter by `endDate` ≥ start |
| `endDate` | `YYYY-MM-DD` | — | Filter by `endDate` ≤ end |
| `brand` | string | — | Partial match on brand name |
| `scrapeSessionId` | UUID | earliest session | Which scrape run to query |
| `order_by` | string | `end_date` | Sort field; prefix `-` for descending |
| `page` | number | `1` | Page number |
| `pageSize` | number | `20` | Items per page (max `100`) |

**`order_by` values:** `end_date`, `-end_date`, `name`, `-name`, `brand`, `-brand`, `tags`, `-tags`

**Response `200`**

```json
{
  "success": true,
  "message": "Promotions retrieved",
  "data": [
    {
      "id": "uuid",
      "uniqueId": "bath_and_body_works_deals_3251680",
      "scrapeSessionId": "uuid",
      "brandId": "uuid",
      "name": "Buy 3, Get 3 Free",
      "description": "Full body care...",
      "imageUrl": "https://...",
      "startDate": "2026-06-01",
      "endDate": "2026-06-21",
      "tags": ["deals"],
      "sourceUrl": "https://www.thepromenadeshopsatbriargate.com/deals/3251680/",
      "sourcePortal": "thepromenadeshopsatbriargate.com",
      "scrapedAt": "2026-06-21T12:00:00.000Z",
      "createdAt": "2026-06-21T12:00:00.000Z",
      "updatedAt": "2026-06-21T12:00:00.000Z",
      "brand": {
        "id": "uuid",
        "uniqueId": "1036000_bath_and_body_works",
        "name": "Bath & Body Works",
        "websiteUrl": "https://...",
        "hours": [{ "label": "Mon–Sat", "value": "10am – 9pm" }],
        "socialLinks": [{ "platform": "instagram", "url": "https://..." }],
        "phone": "719-555-0100",
        "location": null,
        "directoryMapUrl": "https://...",
        "logoUrl": "https://...",
        "description": "..."
      }
    }
  ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total": 25,
      "per_page": 20,
      "from": 1,
      "to": 20
    }
  }
}
```

**Example**

```bash
curl "http://localhost:3001/promotions?search=candle&order_by=-end_date&page=1&pageSize=10"
```

---

### `GET /promotions/:id`

Single promotion with brand metadata.

**Response `200`** — `data` is one promotion object (same shape as list items).

**Response `404`**

```json
{
  "success": false,
  "message": "Promotion not found",
  "errors": ["Not found"]
}
```

---

### `GET /brands`

All brands with promotion counts and nested promotions for a scrape session.

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `scrapeSessionId` | UUID | earliest session | Filter promotions to this session |

**Response `200`**

```json
{
  "success": true,
  "message": "Brands retrieved",
  "data": [
    {
      "id": "uuid",
      "uniqueId": "1036000_bath_and_body_works",
      "name": "Bath & Body Works",
      "websiteUrl": "https://...",
      "hours": [],
      "socialLinks": [],
      "phone": null,
      "location": null,
      "directoryMapUrl": null,
      "logoUrl": "https://...",
      "description": "...",
      "createdAt": "2026-06-21T12:00:00.000Z",
      "updatedAt": "2026-06-21T12:00:00.000Z",
      "promotionCount": 3,
      "promotions": [
        { "...": "same shape as GET /promotions items, without nested brand" }
      ]
    }
  ]
}
```

---

### `GET /scrape-sessions`

List all scrape sessions, newest first.

**Response `200`**

```json
{
  "success": true,
  "message": "Scrape sessions retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Scrape 2",
      "status": "done",
      "recordsFound": 45,
      "recordsEnriched": 42,
      "recordsFailed": 3,
      "error": null,
      "createdAt": "2026-06-21T14:00:00.000Z",
      "updatedAt": "2026-06-21T14:05:00.000Z",
      "promotionCount": 42
    }
  ]
}
```

---

### `GET /scrape-sessions/:id`

Single scrape session by ID.

**Response `200`** — `data` is one session object.

**Response `404`** — session not found.

---

### `POST /scrape`

Start an async scrape. Creates a new scrape session and background job. Multiple scrapes can run at once.

**Response `202`**

```json
{
  "success": true,
  "message": "Scrape job started",
  "data": {
    "jobId": "uuid",
    "scrapeSessionId": "uuid",
    "sessionName": "Scrape 3"
  }
}
```

Poll job status with `GET /scrape/:jobId`, or listen for Socket.IO events (see below).

**Example**

```bash
curl -X POST http://localhost:3001/scrape
```

---

### `GET /scrape/:jobId`

Status of a scrape job.

**Response `200`**

```json
{
  "success": true,
  "message": "Scrape job status retrieved",
  "data": {
    "id": "uuid",
    "status": "running",
    "recordsFound": 45,
    "recordsEnriched": 12,
    "recordsFailed": 1,
    "error": null,
    "createdAt": "2026-06-21T14:00:00.000Z",
    "updatedAt": "2026-06-21T14:02:00.000Z"
  }
}
```

**Status values:** `pending` → `running` → `done` | `failed`

---

## Socket.IO events

Connect to the same host as the API (e.g. `http://localhost:3001`).

| Event | Payload | When |
|-------|---------|------|
| `scrape:active` | `{ scrapeSessionId, sessionName, status }[]` | On connect — pending/running sessions |
| `scrape:started` | `{ jobId, scrapeSessionId, sessionName }` | Job enters running state |
| `scrape:progress` | above + `{ recordsFound, recordsEnriched, recordsFailed }` | During scrape |
| `scrape:completed` | above + progress counts | Job finished successfully |
| `scrape:failed` | above + progress counts + `{ error }` | Job failed |

---

## Quick reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/promotions` | Paginated promotions (filterable, sortable) |
| GET | `/promotions/:id` | Single promotion |
| GET | `/brands` | Brands with nested promotions |
| GET | `/scrape-sessions` | All scrape sessions |
| GET | `/scrape-sessions/:id` | Single scrape session |
| POST | `/scrape` | Start scrape (`202`) |
| GET | `/scrape/:jobId` | Job status |
