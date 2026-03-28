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

-- ===========
-- EXPERIENCES
-- ===========
create table public.experiences (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  title               text not null,
  description         text,                    -- nullable
  location            text,                    -- nullable
  experience_date     date,                    -- nullable
  is_draft            boolean not null default true,
  user_id             uuid not null references public.profiles(id) on delete cascade,
  anchor_fragment_id  uuid,                    -- nullable
  start_date          date,                    -- nullable
  end_date            date                     -- nullable
  emotion_tags        text[] not null default '{}'
);

-- =========
-- FRAGMENTS
-- =========
create table public.fragments (
  id             uuid primary key default gen_random_uuid(),
  experience_id  uuid not null references public.experiences(id) on delete cascade,
  type           public.fragment_type not null,
  caption        text,                          -- nullable
  storage_path   text,                          -- nullable (null for text type)
  text_context   text,                          -- nullable (populated for type = 'text')
  created_at     timestamptz not null default now()
);

alter table public.experiences
  add constraint fk_anchor_fragment
    foreign key (anchor_fragment_id)
    references public.fragments(id)
    on delete set null
    deferrable initially deferred;

alter table public.experiences
  add constraint experiences_published_requires_anchor
  check (is_draft = true or anchor_fragment_id is not null);

alter table public.experiences
  add constraint experiences_date_range_check
  check (start_date is null or end_date is null or start_date <= end_date);

create or replace function private.validate_anchor_fragment()
returns trigger language plpgsql security definer as $$
begin
  if new.anchor_fragment_id is not null then
    if not exists (
      select 1 from public.fragments f
      where f.id = new.anchor_fragment_id
        and f.experience_id = new.id
    ) then
      raise exception 'anchor_fragment_id must belong to this experience';
    end if;
  end if;
  return new;
end;
$$;

create trigger experiences_anchor_check
  before insert or update on public.experiences
  for each row execute procedure private.validate_anchor_fragment();

alter table public.fragments
  add constraint fragments_type_fields_check check (
    (type = 'text' and text_context is not null)
    or
    (type != 'text' and storage_path is not null)
  );

-- ===========
-- REFLECTIONS
-- ===========
create table public.reflections (
  id              uuid primary key default gen_random_uuid(),
  experience_id   uuid not null references public.experiences(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  reflection_text text not null
);

-- ============
-- SYSTEM FLAGS
-- ============
create table public.system_flags (
  id           bigint primary key generated always as identity,
  flagged_user uuid references public.profiles(id) on delete cascade,   -- nullable
  reviewed_by  uuid references public.profiles(id) on delete set null,  -- nullable
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  notes        text                             -- nullable
);

-- ===================
-- UPDATED_AT TRIGGERS
-- ===================
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

-- ===============
-- PRIVATE HELPERS
-- ===============

create or replace function private.get_my_role()
returns text language sql security definer stable as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- ==================
-- ROW-LEVEL SECURITY
-- ==================
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

-- Experiences RLS Policies:

-- Owners can manage experiences
create policy "experiences: owner select" on public.experiences
  for select using (auth.uid() = user_id);

create policy "experiences: owner insert" on public.experiences
  for insert with check (auth.uid() = user_id);

create policy "experiences: owner update" on public.experiences
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "experiences: owner delete" on public.experiences
  for delete using (auth.uid() = user_id);

-- Admins can delete experiences
create policy "experiences: admin delete all" on public.experiences
  for delete using (private.get_my_role() = 'admin');

-- Fragments RLS Policies:

-- Owners can manage fragments of experiences
create policy "fragments: owner select" on public.fragments
  for select using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id
        and e.user_id = auth.uid()
    )
  );

create policy "fragments: owner insert" on public.fragments
  for insert with check (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id
        and e.user_id = auth.uid()
    )
  );

create policy "fragments: owner update" on public.fragments
  for update
  using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id
        and e.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id
        and e.user_id = auth.uid()
    )
  );

create policy "fragments: owner delete" on public.fragments
  for delete using (
    exists (
      select 1 from public.experiences e
      where e.id = experience_id
        and e.user_id = auth.uid()
    )
  );

-- Admins can delete fragments
create policy "fragments: admin delete" on public.fragments
  for delete using (private.get_my_role() = 'admin');

-- Reflections RLS Policies:

-- Owners can manage reflections of experiences
create policy "reflections: owner select" on public.reflections
  for select using (auth.uid() = user_id);

create policy "reflections: owner insert" on public.reflections
  for insert with check (auth.uid() = user_id);

create policy "reflections: owner update" on public.reflections
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reflections: owner delete" on public.reflections
  for delete using (auth.uid() = user_id);

-- Admins can delete reflections
create policy "reflections: admin delete" on public.reflections
  for delete using (private.get_my_role() = 'admin');


-- System Flags RLS Policies:

-- Reviewers and admins can read, update, and insert flags
create policy "system_flags: reviewer read" on public.system_flags
  for select using (
    private.get_my_role() in ('platform_reviewer', 'admin')
  );

create policy "system_flags: reviewer update" on public.system_flags
  for update using (
    private.get_my_role() in ('platform_reviewer', 'admin')
  )
  with check (
    private.get_my_role() in ('platform_reviewer', 'admin')
  );

create policy "system_flags: reviewer insert" on public.system_flags
  for insert with check (
    private.get_my_role() in ('platform_reviewer', 'admin')
  );

create policy "system_flags: admin delete" on public.system_flags
  for delete using (private.get_my_role() = 'admin');
