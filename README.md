# Tynys AI
<p align="center">
  <img src="./tynys-logo.png" alt="Tynys AI logo" width="240" />
</p>

Real-time indoor air quality (IAQ) monitoring for public transport. Ingest CSV sensor streams, store time-series data, and visualize per-user and fleet-wide insights with RBAC and multilingual UI. Developed by the Farabi AGI Center research lab.

## What it does
- Accepts CSV uploads at `/api/ingest` (bearer-authenticated)
- Displays recent and historical readings with filters and stats
- Provides user/admin dashboards via NextAuth-based RBAC
- Supports English, Russian, and Kazakh locales plus dark/light themes

## Stack
- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS + shadcn/ui, Recharts
- PostgreSQL + Drizzle ORM
- NextAuth.js (credentials), bcryptjs, next-themes

## Quick start
1) Install: `npm install`
2) Env + DB: create `.env.local` (see below) and database `createdb tynys`
3) Migrate: `npx drizzle-kit push`
4) Run: `npm run dev` → http://localhost:3000
5) Admin: sign up at `/en/sign-up`, then `npm run set:admin your-email@example.com`

### Required env vars
```
DATABASE_URL=postgresql://user:password@localhost:5432/tynys
DB_URL=postgresql://user:password@localhost:5432/tynys
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
IOT_DEVICE_SECRET=<random-token-for-devices>
```

## Deployment (Docker)
1) Create `.env.production` with the runtime vars:
```
DB_URL=postgresql://user:password@db:5432/tynys
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
IOT_DEVICE_SECRET=<random-token-for-devices>
BLOB_READ_WRITE_TOKEN=<optional-if-using-blob-storage>
```
2) Build the image: `docker build -t tynys:latest .`
3) Run the container: `docker run -p 3000:3000 --env-file .env.production tynys:latest`
4) The image uses Next.js `output=standalone`, runs as a non-root user, and `.dockerignore` strips dev assets (scripts, migrations, tests, docs) to keep the runtime lean.

## Data ingestion
- Endpoint: POST `/api/ingest`
- Auth: `Authorization: Bearer <IOT_DEVICE_SECRET>`
- CSV schema: `timestamp,sensor_id,value[,location,transport_type]`
- Example:
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer your-iot-device-secret" \
  -H "Content-Type: text/csv" \
  --data-binary @sample-data.csv
```

## Auth flows
- Sign up: POST `/api/auth/signup` (email, password)
- Sign in: NextAuth credentials at `/[lang]/sign-in`

## Useful scripts
- `npm run dev` — start app
- `npm run build` / `npm start` — production build/run
- `npm run lint` — lint
- `npm run seed:dummy` — load sample data
- `npm run set:admin <email>` — grant admin role

## Project layout
```
app/            # Next.js routes (app router, i18n folders)
app/api/        # Auth and ingest endpoints
components/     # UI and shared components
lib/            # Auth, db, i18n, CSV parsing, data access
drizzle/        # Migrations
scripts/        # Admin + seeding utilities
```

## License
MIT — see LICENSE.
