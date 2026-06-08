# Lumber Load Planner

Convert DIY project dimensions into a ready-to-buy lumber shopping list. Supports decks, fences, raised garden beds, framing walls, and shed floors. Includes waste-factor adjustment, board-feet totals, estimated cost, shareable URLs, and saved projects (guest localStorage or Supabase-synced when signed in).

**Stack:** React 18 · TypeScript · Vite · React Router v6 · Zustand · React Hook Form + Zod · Supabase

---

## Setup

### 1 — Install dependencies

```bash
npm install
```

### 2 — Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values are found in your Supabase project under **Settings → API**.

> The app works in guest mode without these set — Supabase features (sign-in, cloud-saved projects) will be disabled.

### 3 — Apply the database migration

In your Supabase project run the migration in `supabase/migrations/` via the Supabase CLI or the SQL editor:

```sql
-- creates public.projects with RLS, index, and updated_at trigger
-- see supabase/migrations/20240101000000_create_projects_table.sql
```

### 4 — Run the dev server

```bash
npm run dev
```

App starts at `http://localhost:5173`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Jest unit tests |
| `npm run test:watch` | Jest in watch mode |

---

## Project structure

```
src/
  components/
    auth/          AuthPanel — magic-link sign-in/out
    forms/         One form component per project type
  context/
    AuthContext    Supabase session state via React context
  lib/
    calculations/  Pure calculation engine + unit tests
    database.types Generated Supabase types
    projects.ts    Cloud CRUD helpers (Supabase)
    supabase.ts    Typed Supabase client + auth helpers
  pages/
    ProjectSelector  Home — pick a project type
    Configure        Dimension form + waste factor
    Results          Shopping list, share URL, save
    SavedProjects    Saved project library
  store.ts           Zustand global state
  types/             Shared TypeScript types
```

---

## Auth flow

Sign-in uses Supabase magic links — no passwords. Click **Sign in** in the nav, enter your email, and click the link in your inbox. Projects saved while signed in are stored in Supabase and available on any device. Guest projects live in `localStorage` on the current device only.

---

## Tests

Unit tests cover the full calculation engine (deck, fence, raised garden bed, consolidation logic):

```bash
npm test
```
