-- ================================================================
--  PRIVATE SCHEMA
-- ================================================================

create schema if not exists private;
revoke all on schema private from public;

-- ================================================================
--  PUBLIC SCHEMA
-- ================================================================

-- =====
-- ENUMS
-- =====
create type public.user_role as enum ('user', 'platform_reviewer', 'admin');
create type public.fragment_type as enum ('photo', 'video', 'audio', 'text');

-- ========
-- PROFILES
-- ========
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  role          public.user_role not null default 'user',
  display_name  text
);

-- Auto-create profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- EXPERIENCES
-- ============================================================
create table public.experiences (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  title               text not null,
  description         text,                    -- nullable
  location            text,                    -- nullable
  experience_date     text,                    -- nullable (flexible date string)
  is_draft            boolean not null default false,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  anchor_fragment_id  uuid,                    -- FK added after fragments table; nullable
  start_date          date,                    -- nullable
  end_date            date                     -- nullable
);

-- ============================================================
-- FRAGMENTS
-- ============================================================
create table public.fragments (
  id             uuid primary key default gen_random_uuid(),
  experience_id  uuid not null references public.experiences(id) on delete cascade,
  type           public.fragment_type not null,
  caption        text,                          -- nullable
  storage_path   text,                          -- nullable (null for text type)
  text_context   text,                          -- nullable (populated for type = 'text')
  created_at     timestamptz not null default now()
);

-- Now safe to add the anchor FK back to experiences
alter table public.experiences
  add constraint fk_anchor_fragment
  foreign key (anchor_fragment_id)
  references public.fragments(id)
  on delete set null;

-- ============================================================
-- REFLECTIONS
-- ============================================================
create table public.reflections (
  id              uuid primary key default gen_random_uuid(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete set null,  -- nullable per ERD
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  reflection_text text                          -- nullable
);

-- ============================================================
-- SYSTEM FLAGS
-- ============================================================
create table public.system_flags (
  id           bigint primary key generated always as identity,
  flagged_user uuid references public.profiles(id) on delete cascade,   -- nullable per ERD
  reviewed_by  uuid references public.profiles(id) on delete set null,  -- nullable
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  notes        text                             -- nullable
);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger experiences_updated_at
  before update on public.experiences
  for each row execute procedure public.set_updated_at();

create trigger reflections_updated_at
  before update on public.reflections
  for each row execute procedure public.set_updated_at();

create trigger system_flags_updated_at
  before update on public.system_flags
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- PRIVATE HELPERS
-- ============================================================

create or replace function private.get_my_role()
returns text language sql security definer stable as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.experiences   enable row level security;
alter table public.fragments     enable row level security;
alter table public.reflections   enable row level security;
alter table public.system_flags  enable row level security;

-- Profiles RLS Policies: 

-- Users can read and update their own profile
create policy "profiles: own read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: own update" on public.profiles
  for update using (auth.uid() = id) with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Admins can read, update, and delete all profiles
create policy "profiles: admin read all" on public.profiles
  for select using (private.get_my_role() = 'admin');

create policy "profiles: admin update all" on public.profiles
  for update using (private.get_my_role() = 'admin')
  with check (private.get_my_role() = 'admin');

create policy "profiles: admin delete all" on public.profiles
  for delete using (private.get_my_role() = 'admin');

-- ── Experiences RLS Policies ───────────────────────────────────────────────

-- Users can fully manage their own experiences
create policy "experiences: owner all" on public.experiences
  for all using (auth.uid() = user_id);

-- ── Fragments RLS Policies ─────────────────────────────────────────────────

-- Accessible only if the requesting user owns the parent experience
create policy "fragments: owner all" on public.fragments
  for all using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id and e.user_id = auth.uid()
    )
  );

-- ── Reflections RLS Policies ───────────────────────────────────────────────

-- Users can manage reflections they authored
create policy "reflections: owner all" on public.reflections
  for all using (auth.uid() = user_id);

-- ── System Flags RLS Policies ─────────────────────────────────────────────

-- Reviewers and admins can read all flags
create policy "system_flags: reviewer read" on public.system_flags
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('platform_reviewer', 'admin')
    )
  );

-- Reviewers and admins can update flags (e.g. add notes, set reviewed_by)
create policy "system_flags: reviewer update" on public.system_flags
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('platform_reviewer', 'admin')
    )
  );

-- Only admins can insert or delete flags
create policy "system_flags: admin insert" on public.system_flags
  for insert with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "system_flags: admin delete" on public.system_flags
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
