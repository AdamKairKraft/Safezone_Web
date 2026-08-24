# SafeZone Web

React web frontend for SafeZone — site safety & compliance tracking (incident reports,
toolbox talks, SHE files, compliance tracking, roles & responsibilities) across
industries (construction, food safety, aviation, fire safety, first aid).

Talks to the [`safezone-backend`](../safezone-backend) Spring Boot API. This repo has no
backend of its own — you need that project running locally (or pointed at a deployed
instance) for anything here to actually load data.

## Prerequisites

- **Node.js 22+** and npm (ships with Node)
- A running instance of `safezone-backend` — see that repo's README. Quick version:
  ```bash
  cd ../safezone-backend
  ./start.sh   # starts Postgres + the backend on http://localhost:8080, with demo data
  ```
- The backend's CORS config already allows `http://localhost:5173` (this app's default
  dev port) out of the box — nothing to configure there for local dev.

## Setup

```bash
npm install
cp .env.example .env   # only needed if .env doesn't already exist
```

`.env` sets `VITE_API_BASE_URL` (default `http://localhost:8080`) — point it elsewhere if
your backend isn't running on the default host/port.

## Running locally

```bash
npm run dev
```

Opens on `http://localhost:5173`. With the backend up and seeded (`./start.sh` loads demo
data automatically), log in with any of the demo accounts — password is the same for all
of them:

| Email | Password |
|---|---|
| jane.smith@acme-construction.test | `SafeZone123!` |
| tom.reid@acme-construction.test | `SafeZone123!` |
| lindiwe.mokoena@acme-construction.test | `SafeZone123!` |
| priya.naidoo@skylinefoods.test | `SafeZone123!` |
| carlos.mendes@skylinefoods.test | `SafeZone123!` |
| anna.petrova@skylinefoods.test | `SafeZone123!` |

(Full list and details in `safezone-backend/README.md` under "Demo credentials".)

## Other scripts

```bash
npm run build     # type-check (tsc -b) + production build to dist/
npm run preview   # serve the production build locally
npm run lint      # eslint
```

## Project layout

```
src/
  api/          One file per backend resource (auth, reports, compliance, sheFiles, ...)
  auth/         Auth state (Zustand store), silent token refresh, ProtectedRoute
  components/   Shared UI (AppShell/sidebar, Pill, Card, Tabs, DynamicField, Modal, ...)
  pages/        One page per screen (Dashboard, Roles, Reporting, Report Builder, SHE
                Files, Compliance Tracker, Settings) + LoginPage
  lib/          Formatting helpers, status→pill-color mappings
  types/        TypeScript types mirroring the backend's DTOs
```

Report forms are **dynamic**: the Report Builder renders its fields from whatever
`formSchema` the backend returns for the selected report type
(`GET /api/industry-modules/{code}/report-types`), rather than hardcoding a form per type.

## Known gaps (backend limitations, not bugs here)

- Sites/organizations have no formal "industry module" foreign key in the backend yet —
  the Roles & Responsibilities and Report Builder screens infer it from the current
  site's existing reports (see `src/lib/useSiteIndustryModule.ts`).
- SHE file "upload" registers file **metadata** only — the backend doesn't yet expose a
  real binary storage endpoint (presigned URL or otherwise), so no file content is
  actually stored.
- Only `report` is offline-sync-enabled on the backend today; this web app is online-only
  regardless (the offline-first client is the separate Flutter tablet app).

## Branching & contributing

Mirrors `safezone-backend`'s convention: `dev` is the only permanent branch, protected —
every change lands via a pull request requiring **2 approvals** and a passing CI build
(`.github/workflows/ci.yml`: lint, type-check, build), no direct pushes. Branch off `dev`,
name your branch `<your-name>/<type>/<short-description>` (`type` is `bug`, `task`, or
`refactor`), open a PR back into `dev`. Merged branches are deleted automatically.
