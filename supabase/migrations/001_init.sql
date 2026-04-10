-- Enable gen_random_uuid()
create extension if not exists "pgcrypto";

-- projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tech_stack text[],
  live_url text,
  github_url text,
  featured boolean default false,
  created_at timestamptz default now()
);

-- blogs
create table if not exists blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  published boolean default false,
  created_at timestamptz default now()
);

-- stats
create table if not exists stats (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- 'github' or 'leetcode'
  data jsonb not null,
  synced_at timestamptz default now()
);

create index if not exists stats_platform_synced_at_idx on stats (platform, synced_at desc);
