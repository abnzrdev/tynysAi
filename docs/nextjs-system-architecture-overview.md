# Next.js System Architecture Overview
TynysAi is a **Next.js 14 App Router-only** system (no `pages/` directory) organized around locale-prefixed routes under `app/[lang]`, with middleware-driven locale detection and protected dashboard access. At the platform layer, `app/layout.tsx` composes global client providers (`SessionProvider` for NextAuth session context and `ThemeProvider` for UI theme state), while `app/[lang]/layout.tsx` and `app/[lang]/layout-client.tsx` apply route-scoped UI composition (dashboard sidebar shell vs public pages). Runtime flow is: request enters `middleware.ts` (locale normalization + auth gate for `/dashboard`), server routes/components fetch session and dictionaries, server pages query data via `lib/data-access.ts`, and then pass typed props into client dashboard components for interactive filtering/visualization.

Core boundaries are split cleanly by responsibility: `app/` contains route composition and API route handlers (`app/api/**/route.ts`), `components/` contains client UI primitives and dashboard modules, `lib/` contains domain services (auth, i18n, validation, data-access), and `lib/db/*` owns Drizzle/Postgres schema and connection. Primary integrations are NextAuth Credentials (`lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts` + signup API), IoT ingestion via both CSV (`app/api/ingest/route.ts`) and JSON (`app/api/v1/sensor-data/route.ts`) guarded by `IOT_DEVICE_SECRET`, plus geolocation/i18n locale resolution (`app/api/geolocation/route.ts`, `lib/i18n/location-detection.ts`). State management is intentionally lightweight: server state is fetched in Server Components and API handlers, while client state is localized via React hooks in dashboard clients (`useState`/`useMemo`) and session/theme contexts provided at the root.

## Architecture Visualization
```mermaid
flowchart TD
  U[User Browser] --> M[middleware.ts\nLocale detect + auth guard]

  M --> RL[app/layout.tsx\nThemeProvider + SessionProvider]
  RL --> LL[app/[lang]/layout.tsx]
  LL --> LLC[app/[lang]/layout-client.tsx\nRoute-aware shell]

  LLC --> HP[app/[lang]/page.tsx\nHome Server Component]
  LLC --> DP[app/[lang]/dashboard/page.tsx\nDashboard Server Component]
  DP --> DC[dashboard-client.tsx\nClient analytics + filters]
  HP --> HC[home-page-client.tsx]

  HP --> AUTHS[lib/auth.ts getSession]
  DP --> AUTHS
  HP --> I18N[lib/i18n/dictionaries + config]
  DP --> I18N
  DP --> DA[lib/data-access.ts\ngetUserByEmail/getRecentSensorReadings]

  DA --> DBI[lib/db/index.ts\nDrizzle client]
  DBI --> DBS[lib/db/schema.ts\nusers/sensors/sensor_readings/...]
  DBS --> PG[(PostgreSQL)]

  U --> APIAUTH[app/api/auth/[...nextauth]/route.ts]
  U --> APISU[app/api/auth/signup/route.ts]
  APIAUTH --> AUTHS
  APISU --> DBI

  IOT[IoT Devices] --> APICSV[app/api/ingest/route.ts\nCSV + Bearer secret]
  IOT --> APIJSON[app/api/v1/sensor-data/route.ts\nJSON + validation + dedupe]
  APICSV --> PARSE[lib/csv-parser.ts]
  APICSV --> DA
  APIJSON --> SVAL[lib/sensor-validation.ts]
  APIJSON --> SDA[lib/sensor-data-access.ts]
  SDA --> DBI

  U --> APIGEO[app/api/geolocation/route.ts]
  APIGEO --> LOC[lib/i18n/location-detection.ts]
  LOC --> M
```