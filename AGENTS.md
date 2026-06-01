# AGENTS.md

## Project Map

- `src/routes/` contains TanStack Router file routes. `src/routes/index.tsx` mounts the home page at `/`; `src/routes/__root.tsx` owns document metadata, global CSS links, and the root shell.
- `src/features/` contains feature-owned UI. The starter screen is `src/features/home/home.tsx`; its browser data path uses `src/features/home/template-records.seed.ts`, `src/features/home/template-records.db.ts`, and `src/features/home/use-template-records.ts`.
- `src/components/ui/` contains reusable ShadCN/Radix primitives. Keep project-specific components inside their feature folder unless they are clearly reusable.
- `src/lib/` contains shared frontend helpers, including `cn`.
- `schema/` contains the Drizzle schema that defines the SQLite database shape.
- `src/styles/tailwind.css` contains Tailwind, ShadCN theme tokens, font imports, and global base styles.
- `data/` contains local data artifacts. The starter database is `data/research.sqlite`.
- `.github/workflows/` contains CI and GitHub Pages deployment. Deployment builds `dist/client`, copies `data/` into it, adds `404.html`, and publishes to Pages.
- Generated and dependency output such as `dist/`, `node_modules/`, and `src/routeTree.gen.ts` should not be edited by hand unless the toolchain expects it.

## Common Commands

- `npm install` or `npm ci`: install dependencies.
- `npm run dev`: start Vite on port 3000.
- `npm run build`: build the app and copy `data/` into `dist/client/data`.
- `npm run lint`: run ESLint and TypeScript.
- `npm run typecheck`: run TypeScript only.
- `npx drizzle-kit generate`: generate SQL migrations from the Drizzle schema.
- `npx drizzle-kit migrate`: apply generated migrations to `data/research.sqlite`.

## Database Workflow

This project uses SQLite with Drizzle for schema definition and migrations. Treat `schema/` as the source of truth for database structure, `drizzle.config.ts` as the migration configuration, and `data/research.sqlite` as the local database artifact.

The starter tables are:

- `research_findings`: one row per finding or claim.
- `research_sources`: source records linked to findings.

Inspect the database with:

```sh
sqlite3 data/research.sqlite ".tables"
sqlite3 data/research.sqlite ".schema"
sqlite3 data/research.sqlite "SELECT * FROM research_findings LIMIT 5;"
```

When creating or changing schema:

1. Update the Drizzle schema in `schema/`. Add tables, columns, indexes, relations, and defaults there first.
2. Generate a migration with Drizzle:

```sh
npx drizzle-kit generate
```

3. Review the generated SQL under `data/migrations/`, but do not hand-write or manually edit migration files unless the user explicitly asks for a one-off repair.
4. Apply the generated migration locally:

```sh
npx drizzle-kit migrate
```

5. Verify the database:

```sh
sqlite3 data/research.sqlite ".schema"
sqlite3 data/research.sqlite "PRAGMA foreign_key_check;"
```

6. Commit the Drizzle schema changes, generated migration files, and updated `data/research.sqlite` when the database artifact is part of the requested change.

Agents should never create raw migrations by hand. Build the database schema with Drizzle first, then let Drizzle generate and apply migrations.

When inserting or updating research data, prefer checked SQL or small import scripts over one-off manual edits. Keep durable source data in `data/`.

Important runtime boundary: the deployed app is static GitHub Pages output. Browser UI cannot write to `data/research.sqlite` at runtime. If the UI needs database-backed data, generate a JSON/CSV/static artifact from SQLite during development or add an explicit server/build-time data loading path before wiring the UI to it.

## Browser Data With Dexie

Use Dexie as the browser translation layer for page data that originates in SQLite:

1. Read from `data/research.sqlite` during development or build-time data preparation.
2. Extract the rows needed by the UI into a feature-owned seed file, such as `src/features/home/template-records.seed.ts`.
3. Define the matching Dexie database, object stores, indexes, and seed-version metadata in a feature-owned `*.db.ts` file.
4. Query Dexie from a React hook, such as `src/features/home/use-template-records.ts`.
5. Keep feature screens as hook consumers. Do not import seed files directly into components except inside the Dexie setup.

When seed data changes, update the seed version constant so existing IndexedDB stores are refreshed in the browser. Keep seed file shapes aligned with the feature types and Dexie indexes.

## Updating The UI

- Put feature screens and feature-specific components under `src/features/<feature-name>/`.
- Add or update file routes in `src/routes/`, then import feature components from `src/features/`. TanStack generates `src/routeTree.gen.ts`.
- Use shared UI primitives from `src/components/ui/` before creating new primitives.
- Use `lucide-react` icons for actions where an icon exists.
- Keep global theme changes in `src/styles/tailwind.css`; keep feature layout and state inside the feature folder.
- Keep imported static data near the feature when it is feature-specific, or under `data/` when it is a shared/generated artifact.

For the current home table:

- Edit `src/features/home/home.tsx` for table behavior, sorting, filtering, layout, and visible columns.
- Edit `src/features/home/template-records.seed.ts` for starter records displayed by that screen, and bump `templateRecordsSeedVersion` when those records change.
- Keep `src/features/home/template-records.db.ts` and `src/features/home/use-template-records.ts` as the Dexie database and query hook for that screen.
- Keep row heights, grid columns, and virtualizer assumptions in sync if you change the table structure.

After UI changes, run:

```sh
npm run lint
npm run build
```

For meaningful visual changes, also start `npm run dev` and inspect the page in a browser at `http://localhost:3000`.
