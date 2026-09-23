# COLOR

A palette community, grown out of `projects/first-website`, dressed as a paint counter: the page is
a pegboard and palettes hang on it as paint chips. Mix palettes (random or by harmony — analogous,
complementary, triad, mono — with undo), every colour gets a real name, publish to the rack, and
heart other people's. Built with Nuxt 4 (Vue) and Supabase.

Colour names come from [color-name-list](https://github.com/meodai/color-name-list) (MIT), "best of"
set, matched by nearest colour in OKLab.

Design: [docs/superpowers/specs/2026-09-23-color-community-design.md](docs/superpowers/specs/2026-09-23-color-community-design.md)

## Run it

```bash
npm install
cp .env.example .env   # then fill in SUPABASE_URL and SUPABASE_KEY
npm run dev            # http://localhost:3000
```

### Database

The schema lives in [supabase/migrations/20260923000000_init.sql](supabase/migrations/20260923000000_init.sql):
tables, triggers, grants and Row Level Security.

- **Hosted Supabase:** paste the migration into the SQL editor and run it, or use `npx supabase db push`.
  For local development, turn off Auth → Providers → Email → "Confirm email", or sign-up waits
  for the confirmation link.
- **Local Supabase (Docker):** run `npx supabase start`. It applies the migration and prints
  the URL and publishable key for `.env`. Email confirmation is already off locally.

## Scripts

| | |
|---|---|
| `npm run dev` | dev server with hot reload |
| `npm test` | unit tests: colour, harmony, names, undo |
| `npm run typecheck` | Vue + TypeScript check |
| `npm run build` | production build |

## Where things are

```
app/
  pages/          one file per route (/generate, /explore, /p/[id], /u/[username], …)
  components/     NavBar, Swatch, PaintChip, LikeButton, …
  composables/    usePalettes (every Supabase query), useMyLikes, useAuthRedirect
  middleware/     guest — keeps logged-in users off /login and /signup
  utils/          color.ts (random, harmony, hex, contrast), colorNames.ts, history.ts (undo)
  types/          row types + the Database type for the Supabase client
supabase/         migration + local CLI config
tests/            vitest
```

Security is enforced in Postgres, not in the app. Anyone can read. You can only create or delete
your own palettes and likes. Nobody can edit a palette or its like count from the browser. The
like count only changes through the trigger on `likes`.
