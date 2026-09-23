-- COLOR palette community — run once in the Supabase SQL editor.

-- ─── Tables ────────────────────────────────────────────────────────────────

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

create table public.palettes (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references public.profiles (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 40),
  -- exactly five lowercase #rrggbb colours
  colors     text[] not null
             check (array_to_string(colors, ',') ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6}){4}$'),
  like_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index palettes_new_idx     on public.palettes (created_at desc);
create index palettes_popular_idx on public.palettes (like_count desc, created_at desc);
create index palettes_author_idx  on public.palettes (author_id, created_at desc);

create table public.likes (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  palette_id uuid not null references public.palettes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, palette_id)
);

create index likes_palette_idx on public.likes (palette_id);

-- ─── Triggers ──────────────────────────────────────────────────────────────

-- Every new auth user gets a profile, using the username passed to signUp()
-- as options.data.username. A missing or taken username makes signUp fail.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(new.raw_user_meta_data ->> 'username'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- like_count is only ever changed here. Users have no UPDATE right on
-- palettes, so this runs as the table owner (security definer).
create function public.bump_like_count()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.palettes set like_count = like_count + 1 where id = new.palette_id;
  else
    update public.palettes set like_count = like_count - 1 where id = old.palette_id;
  end if;
  return null;
end;
$$;

create trigger likes_count
  after insert or delete on public.likes
  for each row execute function public.bump_like_count();

-- ─── Privileges ────────────────────────────────────────────────────────────
-- Column-level INSERT grants mean nobody can send their own like_count,
-- id or created_at — the database fills those in.

revoke all on public.profiles, public.palettes, public.likes from anon, authenticated;

grant select on public.profiles, public.palettes, public.likes to anon, authenticated;
grant insert (author_id, name, colors), delete on public.palettes to authenticated;
grant insert (user_id, palette_id), delete on public.likes to authenticated;

-- ─── Row Level Security ────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.palettes enable row level security;
alter table public.likes    enable row level security;

create policy "profiles are public"
  on public.profiles for select using (true);

create policy "palettes are public"
  on public.palettes for select using (true);
create policy "publish as yourself"
  on public.palettes for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "delete your own palettes"
  on public.palettes for delete to authenticated
  using (author_id = (select auth.uid()));

create policy "likes are public"
  on public.likes for select using (true);
create policy "like as yourself"
  on public.likes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "unlike your own likes"
  on public.likes for delete to authenticated
  using (user_id = (select auth.uid()));
