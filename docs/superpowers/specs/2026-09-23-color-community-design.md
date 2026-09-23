# COLOR — palette community (design)

Date: 2026-09-23
Status: implemented

## Why

Rebuild `projects/first-website` (a static "Choose your colors" landing page) into a working
full-stack app, as a way to learn **Nuxt (Vue)** and **Supabase**. The code should teach: short
comments explain a Nuxt/Vue/Supabase concept the first time it appears.

## Scope

v1 includes:

- **Generator**: 5 swatches, press space to reroll, lock individual colours, edit a hex code by hand.
- **Accounts**: sign up / log in / log out with email + password; username chosen at sign-up.
- **Publish**: a logged-in user saves the current generator palette with a name.
- **Feed** (`/explore`): all palettes, sorted New or Popular, 24 per page with "Load more".
- **Likes**: logged-in users like / unlike any palette.
- **Palette page**: one palette large, copy each hex, author link, like, delete (author only).
- **Profile pages**: a user's published palettes, plus a Liked tab.

Not in v1: tags and search, remixing palettes, export formats, comments, OAuth logins, editing
palettes after they are published, changing your username, and deployment. v1 is done when
everything runs locally with `npm run dev` against a free Supabase project.

`projects/first-website` stays untouched. The new app is at `projects/color-community`.

## Stack

- Nuxt 4 (`app/` directory layout), TypeScript, Vue 3 `<script setup>`
- `@nuxtjs/supabase` for the Supabase client, the user session and the auth redirect
- Supabase: Postgres, Auth and Row Level Security. There is no custom server code: the browser
  talks to Supabase directly, and RLS is the security boundary.
- Vitest for the unit tests on the pure colour logic
- Embedding the author must name the key (`profiles!palettes_author_id_fkey`): palettes also
  reach profiles through `likes`, and PostgREST rejects an ambiguous embed
- Plain scoped CSS (no Tailwind) and the Kumbh Sans font, which keeps the look of the first site:
  `#131313` background, gradient text and gradient buttons

## Pages

| Route | Content | Auth |
|---|---|---|
| `/` | Old hero ("Choose your colors"), CTA to generator, strip of 8 most-liked palettes | — |
| `/generate` | Generator + Publish | publishing needs login |
| `/explore` | Feed, New/Popular toggle (`?sort=popular`) | liking needs login |
| `/p/[id]` | Single palette | like/delete need login |
| `/u/[username]` | Tabs: Palettes / Liked | — |
| `/login`, `/signup` | Auth forms | guests only |

The NavBar is the old navbar ported to a component: the COLOR logo, then Explore and Generate,
then either Log in and Sign up, or the user's @username and Log out. The mobile hamburger menu is
kept.

## Structure

```
app/
  pages/            routes above
  components/
    NavBar.vue
    Swatch.vue        one colour: fill, hex label (readable text colour), lock, copy
    PaletteStrip.vue  5 colours side by side (used by card + palette page)
    PaletteCard.vue   strip + name + @author + LikeButton, links to /p/[id]
    LikeButton.vue    heart + count, optimistic toggle
  composables/
    usePalettes.ts    all palette/like/profile queries in one place
  middleware/
    guest.ts          send logged-in users away from /login and /signup
  utils/
    color.ts          pure colour functions (unit tested)
  types/
    index.ts          Palette, Profile row types
    database.types.ts Database type for the typed Supabase client
supabase/
  migrations/20260923000000_init.sql   tables, constraints, triggers, grants, RLS
  config.toml       local Supabase CLI config
tests/
  color.test.ts
```

Pages never call Supabase directly. They go through `usePalettes`, so the query code sits in one
place and each page only handles display.

## Generator behaviour

- `utils/color.ts` contains:
  - `randomColor()`: HSL with saturation 45–90% and lightness 35–75%, so colours never come out
    muddy, returned as `#rrggbb`
  - `generate(current, locked)`: rerolls every colour that isn't locked
  - `normalizeHex(input)`: accepts `abc`, `#ABC` or `aabbcc` and returns `#aabbcc`, or `null` if
    the input is invalid
  - `textColorFor(hex)`: returns black or white, whichever has better contrast
- The current colours live in the URL (`/generate?c=ff0844-ffb199-...`). This keeps the palette
  through the login redirect and makes it shareable. Locks are not stored in the URL.
- The space bar rerolls unless focus is in an input.
- Clicking Publish while logged out goes to `/login?redirect=<current url>`, and the user comes
  back to the same palette afterwards.
- Publish asks for a name (1–40 characters), inserts the palette and goes to `/p/[id]`.

## Data model (`supabase/migrations/20260923000000_init.sql`)

```
profiles  id uuid PK → auth.users(id) on delete cascade
          username text unique not null, check ^[a-z0-9_]{3,20}$
          created_at timestamptz default now()

palettes  id uuid PK default gen_random_uuid()
          author_id uuid not null → profiles(id) on delete cascade
          name text not null, check length 1–40
          colors text[] not null,
            check array_to_string(colors, ',') ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6}){4}$'   -- exactly 5 lowercase hex
          like_count int not null default 0
          created_at timestamptz default now()
          index (created_at desc), index (like_count desc, created_at desc)

likes     user_id uuid → profiles(id) on delete cascade
          palette_id uuid → palettes(id) on delete cascade
          created_at timestamptz default now()
          PK (user_id, palette_id)
```

Triggers:

- **Profile creation**: `on insert into auth.users` creates a `profiles` row from
  `raw_user_meta_data->>'username'`, which the sign-up form passes as `options.data.username`.
- **Like count**: `on insert/delete on likes` increments or decrements `palettes.like_count`. The
  function is `security definer` because users have no update permission on palettes.

## Security (Row Level Security, on for all three tables)

| Table | select | insert | update | delete |
|---|---|---|---|---|
| profiles | everyone | none (trigger only) | none | none |
| palettes | everyone | `author_id = auth.uid()` | none | `author_id = auth.uid()` |
| likes | everyone | `user_id = auth.uid()` | none | `user_id = auth.uid()` |

With no update policy on palettes, nobody can edit a palette from the browser. INSERT is granted
per column (`author_id, name, colors` on palettes), so nobody can send their own `like_count`
either. The only way the count changes is the likes trigger. The anon key in `.env` is public by
design, and RLS is what protects the data.

## Error handling

- **Username taken at sign-up**: the form checks availability first. If a race still hits the
  unique constraint, Supabase returns "Database error saving new user", which the form shows as
  "Username already taken".
- **Email confirmation**: if Supabase has "Confirm email" on, `signUp` returns no session, and the
  form shows "Check your inbox". The README says to turn it off for local development.
- **Missing palette or user**: the page throws `createError({ statusCode: 404 })` and Nuxt shows its
  error page, styled to match the site.
- **Like button**: it updates the count immediately. If the request fails, it reverts and shows an
  inline error.
- **Publish and delete**: the button is disabled while the request runs, and any error shows under
  it.
- **Any query failure**: an inline message with a Retry button, never a blank page.

## Testing

- Vitest unit tests for `utils/color.ts`: hex format, saturation and lightness ranges, locked colours
  surviving `generate`, `normalizeHex` edge cases, `textColorFor` on black, white and midtones.
- Manual end-to-end checklist, run against a real Supabase project before calling v1 done:
  1. Sign up and check the profile row exists.
  2. Try a duplicate username.
  3. Generate, lock and reroll.
  4. Publish while logged out, then log in and publish.
  5. Check New and Popular order in the feed.
  6. Like and unlike, and check the count persists.
  7. Delete your own palette, and check you can't delete another user's.
  8. Check both profile tabs.
  9. Check the mobile menu.
- RLS check: in the Supabase SQL editor, attempt an update or foreign insert as another user and
  confirm it is rejected.

## Setup the user must do

1. Create a free Supabase project.
2. Run `supabase/migrations/20260923000000_init.sql` in its SQL editor (or `npx supabase start` for a local Docker stack).
3. Copy the project URL and anon key into `.env` as `SUPABASE_URL` and `SUPABASE_KEY`.
4. For local development, turn off "Confirm email" (Auth → Providers → Email).
