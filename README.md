# Lumber Load Planner

Convert DIY project dimensions into a ready-to-buy lumber shopping list. Supports decks, fences, raised garden beds, framing walls, shed floors, and pergolas. Includes waste-factor adjustment, board-feet totals, estimated cost range, shareable URLs, saved projects, build timeline estimates, smart material warnings, and a polished chip-based configure UI.

**Stack:** React 18 · TypeScript · Vite · React Router v6 · Zustand · React Hook Form + Zod · Supabase

---

## Features

**Six project types** — Deck, Fence, Raised Garden Bed, Framing Wall, Shed Floor, Pergola. Each has a dedicated calculation engine and configure form.

**Live estimate preview** — The configure form shows a real-time board count, total board feet, and estimated cost range as you adjust dimensions. No submit required.

**Waste factor** — Adjustable percentage added to every quantity so your shopping list accounts for cuts and defects.

**Project Timeline Estimator** — Results page surfaces a per-phase build schedule (materials + prep, framing, finishing) with realistic day counts based on project type and size.

**Smart Warnings** — Results page flags common material and structural issues automatically: spans that exceed safe joist/rafter limits, post spacing outside typical range, unusually tall walls, and more. Warnings are scoped to each project type and shown inline before the shopping list.

**Saved Project Gallery** — Save any result as a named project. The gallery renders an SVG thumbnail preview sized to the project footprint for quick visual identification. Guest projects persist to `localStorage`; signed-in projects sync to Supabase and are available on any device.

**Shareable URLs** — Every result page encodes its dimensions in the URL so you can copy and share a direct link to any project configuration.

**Lumber Guide** — Reference page with nominal vs. actual dimensions and SVG cross-section diagrams for common lumber sizes.

**Polished configure forms** — Chip-group toggles replace native `<select>` elements for all enum fields (joist/stud/rafter spacing, board size, post size, etc.). Boolean fields use an iOS-style toggle switch. All controls meet 44px minimum touch targets and include full ARIA labeling.

**Imperial/metric toggle** — All dimension inputs switch between feet/inches and metric on the fly.

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

> The app runs in guest mode without these set — sign-in and cloud-saved projects are disabled, but all calculators work normally.

### 3 — Apply the database migration

Run the migration in `supabase/migrations/` via the Supabase CLI or the SQL editor in your Supabase project:

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
    auth/
      AuthPanel          Magic-link sign-in / sign-out
    forms/
      ChipGroup          Pill-toggle group replacing native selects
      ToggleSwitch       iOS-style boolean toggle
      FormField          Label + input + error wrapper
      UnitInput          Dimension input with imperial/metric switching
      SubmitButton       Animated submit button
      shared.ts          Shared style tokens (inputStyle, previewBoxStyle, hintStyle, etc.)
      DeckForm
      FenceForm
      RaisedGardenBedForm
      FramingWallForm
      ShedFloorForm
      PergolaForm
    WarningsCard          Smart warnings panel shown on Results page
  context/
    AuthContext           Supabase session state via React context
  lib/
    calculations/         Pure calculation engine + unit tests
      deck · fence · raised-bed · framing-wall · shed-floor · pergola
    warnings.ts           Per-project warning rule engine
    database.types        Generated Supabase types
    projects.ts           Cloud CRUD helpers (Supabase)
    supabase.ts           Typed Supabase client + auth helpers
  pages/
    ProjectSelector       Home — pick a project type
    Configure             Dimension form + waste factor
    Results               Shopping list · timeline · warnings · share URL · save
    SavedProjects         Saved project gallery with SVG thumbnail previews
    LumberGuide           Nominal vs. actual dimension reference
  store.ts                Zustand global state
  types/                  Shared TypeScript types
```

---

## Auth flow

Sign-in uses Supabase magic links — no passwords. Click **Sign in** in the nav, enter your email, and click the link in your inbox. Projects saved while signed in are stored in Supabase and accessible on any device. Guest projects live in `localStorage` on the current device only.

---

## Tests

Unit tests cover the full calculation engine across all six project types plus the warning rule engine:

```bash
npm test
```

CI runs lint → tests → `tsc --noEmit` → production build on every push to `master` and deploys to Vercel on success.
