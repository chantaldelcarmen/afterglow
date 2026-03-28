alter table public.experiences
  add column if not exists emotion_tags text[] not null default '{}';