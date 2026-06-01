# Data Boilerplate

A reusable starter for research and data projects. It combines a small
TanStack React app, common ShadCN UI components, and a clean SQLite database so
you can clone the repo, hand it to an agent, store findings in `data`, and then
build a focused UI around the results.

## What's Included

- React, Vite, TanStack Router, TanStack Start, Tailwind CSS, and ShadCN.
- A single `home` feature with a basic landing page.
- Common ShadCN primitives in `src/components/ui`.
- Shared frontend utilities in `src/lib`.
- A clean SQLite database at `data/research.sqlite`.
- GitHub Pages deployment and lint/typecheck workflows.

## Project Layout

```txt
data/
  research.sqlite
src/
  components/ui/
  features/home/
  lib/
  routes/
  styles/
```

## Local Setup

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build the app:

```sh
npm run build
```

Run lint/type checks:

```sh
npm run lint
```

## SQLite Starter

Open the database:

```sh
sqlite3 data/research.sqlite
```

The starter database is intentionally small and neutral:

- `research_findings`: one row per finding or claim.
- `research_sources`: source records linked to findings.

Agents can add project-specific tables as the research domain becomes clearer.

## Adding UI

Use `src/features/home` as the initial example and add new feature folders under
`src/features`. Keep reusable UI primitives in `src/components/ui`; keep
project-specific components near the feature that owns them.

## Deploying

The included deploy workflow publishes `dist/client` to GitHub Pages. When run
from GitHub Actions, the Vite base path is derived from `GITHUB_REPOSITORY`, so
the project can be renamed after cloning without editing `vite.config.ts`.

## License

MIT
