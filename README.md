# Tynys AI — Indoor Air Quality Monitoring Platform

Real-time IAQ monitoring for public transport and smart environments.
Built by the **Farabi AGI Center** research lab.

Devices push sensor readings to the API. The platform stores them in PostgreSQL
and surfaces per-user and fleet-wide dashboards, charts, maps, and PDF reports —
with multilingual support (EN / RU / KZ) and dark/light themes.

---

## Stack

| Layer            | Technology                                          |
| ---------------- | --------------------------------------------------- |
| Framework        | Next.js 14 (App Router)                             |
| Language         | TypeScript 5                                        |
| UI               | React 18, Tailwind CSS, shadcn/ui, Radix UI         |
| Charts / Maps    | Recharts, Leaflet + react-leaflet                   |
| Animations       | Framer Motion                                       |
| Database         | PostgreSQL 16                                       |
| ORM              | Drizzle ORM + postgres.js                           |
| Auth             | NextAuth.js v4 (JWT, 30-day session)                |
| Password hashing | bcryptjs (12 rounds)                                |
| PDF              | jsPDF + jspdf-autotable                             |
| Containerization | Docker (multi-stage), Docker Compose                |
| CI/CD            | GitHub Actions                                      |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop running

### 1. Clone and install

```bash
git clone https://github.com/your-org/tynys-ai.git
cd tynys-ai
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
DB_URL=postgresql://admin:password123@localhost:5433/tynysdb
DATABASE_URL=postgresql://admin:password123@localhost:5433/tynysdb
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=        # openssl rand -base64 32
IOT_DEVICE_SECRET=      # openssl rand -base64 32 (optional for local dev)
```

### 3. Start development

```bash
# One command — starts Postgres, pushes schema, runs dev server
./scripts/dev-start.sh
```

Or manually:

```bash
docker compose up -d postgres   # start Postgres on port 5433
npx drizzle-kit push            # create DB tables (first time only)
npm run dev                     # http://localhost:3000
```

### 4. Create admin account

```bash
# Sign up at /en/sign-up first, then run:
npm run set:admin your@email.com
```

---

## Environment Files

| File | Used for |
|------|----------|
| `.env.local` | Local dev with `npm run dev` |
| `.env` | Local dev with Docker (`docker compose up`) |
| `.env.production` | Production server deploy |

> Never commit any `.env*` files to Git except `.env.example`.

---

## Data Ingestion API

All endpoints require `Authorization: Bearer <IOT_DEVICE_SECRET>`.

### CSV — `POST /api/ingest`

```
Content-Type: text/csv

timestamp,sensor_id,value[,location,transport_type]
2024-01-15T10:30:00Z,lab01,45.2,Station A,metro
```

### JSON — `POST /api/v1/sensor-data`

```json
{
  "device_id": "lab01",
  "site": "AGI_Lab",
  "timestamp": "2024-01-15T10:30:00Z",
  "readings": {
    "pm1": 12.3, "pm25": 25.7, "pm10": 43.1,
    "co2": 412, "voc": 0.65, "temp": 21.8,
    "hum": 46.2, "co": 0.1, "o3": 18.5, "no2": 14.2
  },
  "metadata": { "battery": 87, "signal": -65, "firmware": "2.1.4" }
}
```

---

## Database

**Engine:** PostgreSQL 16 · **ORM:** Drizzle ORM

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Registered accounts |
| `sites` | Physical deployment locations |
| `sensors` | Sensor device registry |
| `sensorReadings` | Time-series readings (primary data) |
| `sensorHealth` | Periodic health snapshots per sensor |

### Migrations

```bash
npx drizzle-kit push      # dev — apply schema directly
npx drizzle-kit generate  # prod — generate migration file
npm run migrate           # prod — apply migration file safely
```

> ⚠️ Migration `0008` drops and recreates `sensorReadings`. Always back up before running on production.

---

## Docker

```bash
# Local dev — Postgres only
docker compose up -d postgres

# Full local Docker stack
docker compose up -d

# Production
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up -d --build
```

The multi-stage Dockerfile builds: `deps → builder → runner` (node 20-alpine, non-root user).
Migrations run automatically on container startup via `docker-entrypoint.sh`.

---

## Useful Scripts

```bash
npm run dev                  # Start dev server
npm run build                # Production build
npm run type-check           # TypeScript check
npm run lint                 # ESLint
npm run seed                 # Seed test data
npm run set:admin <email>    # Grant admin role
npx drizzle-kit push         # Apply DB schema
npx drizzle-kit studio       # Open Drizzle GUI
./scripts/dev-start.sh       # Full dev startup with checks
```

---

## Localization

Supported: **en** (default) · **ru** · **kz**

Detection priority: URL prefix → cookie → IP geolocation → `Accept-Language` header → default.

---

## License

MIT — see `LICENSE`.
