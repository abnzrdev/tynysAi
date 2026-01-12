# GitHub Copilot Instructions (TynysAi Project)

## Architecture Primer
- **Next.js 14 App Router:** Root layout handles `SessionProvider`, `ThemeProvider`, and `Navbar`.
- **I18n:** Routes live under `app/[lang]`. Supported locales: `en`, `ru`, `kz`. Dictionaries are in `lib/i18n/dictionaries/*.json`.
- **Auth:** Server-side session checks in dashboards via `lib/auth.ts`. Redirect missing sessions to `/${lang}/sign-in`.

## UI & Styling Conventions (Standard: Modern SaaS / Dashboard)
- **Design System:** Use `shadcn/ui` (Radix + Tailwind) and `Lucide-React` icons.
- **Visual Hierarchy:** - Use **Bento Grid** layouts for dashboard sections.
  - Metrics cards should include **Sparklines** (mini-charts) to show trends, not just static numbers.
  - Numerical data should use **Monospaced fonts** (e.g., `font-mono`) for alignment stability.
- **Charts:** Use `Recharts`. Prefer Area Charts with color gradients (Green-to-Red) to indicate AQI severity thresholds.
- **Maps:** `AirQualityMap` (Leaflet) must be `ssr: false`. Use **Marker Clustering** for high-density sensor areas.
- **Animations:** Use `framer-motion` for page transitions and data-loading states.

## Data & Persistence
- **Drizzle ORM:** Centralized in `lib/db/index.ts`. Schema in `lib/db/schema.ts`.
- **Ingestion:** `app/api/ingest/route.ts` handles CSV data. Requires `Authorization: Bearer <IOT_DEVICE_SECRET>`.
- **Data Access:** All queries in `lib/data-access.ts` must enforce `userId` isolation unless explicitly marked as `admin` helpers.

## Patterns & Reminders
- **Translations:** Sync client-side translation maps in Auth pages with JSON dictionaries.
- **State:** Use `useOptimistic` for UI updates like filter changes.
- **Clean Code:** Use the `cn` utility from `lib/utils.ts` for all conditional class merging.
- **Components:** Favor composition. Do not create new base components if a `shadcn` primitive exists.

## Development Workflow
- **Migrations:** Use `npx drizzle-kit push` for schema changes.
- **Scripts:** Admin elevation via `scripts/set-admin.ts`.
- **Testing:** Manually verify hydration for Leaflet and Recharts components after every UI change.