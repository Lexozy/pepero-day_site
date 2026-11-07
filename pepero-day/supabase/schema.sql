-- =====================================================================
-- Pepero Day Invitation — Supabase schema
-- Supabase Dashboard → SQL Editor → New query → энэ файлыг бүтнээр нь ажиллуул.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. ADMINS — admin dashboard-д нэвтрэх эрхтэй auth хэрэглэгчид
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Тухайн нэвтэрсэн хэрэглэгч admin эсэх (RLS policy-д ашиглана)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------
-- 2. SESSIONS — нэг хүлээн авагчийн нэг session (төлөвийн snapshot)
-- ---------------------------------------------------------------------
create table if not exists public.sessions (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),   -- website анх нээсэн цаг
  updated_at           timestamptz not null default now(),
  last_seen_at         timestamptz not null default now(),
  visit_count          integer     not null default 1 check (visit_count >= 1),
  user_agent           text,

  -- Page 1
  q1_answer            text check (q1_answer in ('yes', 'no')),
  q1_answered_at       timestamptz,

  -- Page 2 (зөвхөн "Тэгье" бодит хариулт болно)
  q2_answer            text check (q2_answer in ('yes')),
  q2_answered_at       timestamptz,
  no_button_dodges     integer not null default 0 check (no_button_dodges >= 0), -- analytics only

  -- Page 3
  gift_opened          boolean not null default false,
  gift_opened_at       timestamptz,

  -- Page 4
  message              text check (char_length(message) between 1 and 2000),
  message_submitted_at timestamptz,

  -- Төгсгөл
  completed            boolean not null default false,
  completed_at         timestamptz,

  -- Admin "шинэ" тэмдэглэгээ
  admin_seen_at        timestamptz,

  constraint sessions_q1_consistency check ((q1_answer is null) = (q1_answered_at is null)),
  constraint sessions_q2_consistency check ((q2_answer is null) = (q2_answered_at is null)),
  constraint sessions_gift_consistency check (gift_opened = (gift_opened_at is not null)),
  constraint sessions_message_consistency check ((message is null) = (message_submitted_at is null)),
  constraint sessions_completed_consistency check (completed = (completed_at is not null))
);

create index if not exists sessions_updated_at_idx on public.sessions (updated_at desc);
create index if not exists sessions_created_at_idx on public.sessions (created_at desc);
create index if not exists sessions_message_submitted_idx on public.sessions (message_submitted_at desc) where message_submitted_at is not null;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. EVENTS — үйлдэл бүрийн timeline (append-only)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  session_id  uuid not null references public.sessions (id) on delete cascade,
  type        text not null check (type in (
                'visit',            -- website нээсэн / дахин орж ирсэн
                'q1_answered',      -- payload: {answer: 'yes'|'no'}
                'q2_answered',      -- payload: {answer: 'yes'}
                'no_button_dodge',  -- analytics: payload: {count: n}
                'gift_opened',
                'message_submitted',
                'session_completed'
              )),
  is_analytics boolean not null default false, -- бодит хариулт (false) vs interaction analytics (true)
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists events_session_created_idx on public.events (session_id, created_at);
create index if not exists events_type_idx on public.events (type);

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
--    * anon (public key) — ЮУ Ч хийж чадахгүй. Бүх бичилт Next.js server
--      route-оор дамжин service role key-ээр хийгдэнэ.
--    * authenticated + admins table-д байгаа хэрэглэгч — унших, admin_seen_at засах.
-- ---------------------------------------------------------------------
alter table public.admins   enable row level security;
alter table public.sessions enable row level security;
alter table public.events   enable row level security;

drop policy if exists "admins: read own row"      on public.admins;
drop policy if exists "sessions: admin read"      on public.sessions;
drop policy if exists "sessions: admin update"    on public.sessions;
drop policy if exists "events: admin read"        on public.events;

create policy "admins: read own row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

create policy "sessions: admin read"
  on public.sessions for select
  to authenticated
  using (public.is_admin());

create policy "sessions: admin update"
  on public.sessions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "events: admin read"
  on public.events for select
  to authenticated
  using (public.is_admin());

-- anon role-д ямар ч policy байхгүй → бүх хандалт хаалттай.

-- ---------------------------------------------------------------------
-- 5. ADMIN ЭРХ ӨГӨХ (admin account үүсгэсний дараа ажиллуулна)
--    Authentication → Users дээр хэрэглэгч үүсгээд, доорх мөрийн email-ийг соль:
-- ---------------------------------------------------------------------
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'me@example.com'
-- on conflict do nothing;
