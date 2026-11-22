create extension if not exists "pgcrypto";

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  department text not null check (department in ('cardiology', 'pediatrics', 'dentistry', 'dermatology', 'orthopedics', 'ophthalmology')),
  title text not null default '',
  experience_years integer not null default 5 check (experience_years >= 0),
  fee numeric(10, 2) not null check (fee >= 0),
  summary text not null default '',
  bio text not null default '',
  expertise text[] not null default '{}',
  education text[] not null default '{}',
  available_days text[] not null default '{}',
  time_slots text[] not null default '{}',
  images text[] not null default '{}',
  is_featured boolean not null default false
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  doctor_id uuid references public.doctors (id) on delete set null,
  doctor_name text not null default '',
  department text not null default '',
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  email text not null default '' check (char_length(email) <= 160),
  age integer check (age is null or age between 0 and 120),
  visit_date text not null check (visit_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  visit_time text not null check (char_length(visit_time) between 3 and 10),
  reason text not null default '' check (char_length(reason) <= 1000),
  status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled'))
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create index if not exists doctors_department_idx on public.doctors (department);
create index if not exists doctors_featured_idx on public.doctors (is_featured);
create index if not exists appointments_created_idx on public.appointments (created_at desc);
create unique index if not exists appointments_slot_unique
  on public.appointments (doctor_id, visit_date, visit_time)
  where status <> 'cancelled';

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.taken_slots(p_doctor uuid, p_date text)
returns text[]
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(array_agg(visit_time), '{}')
  from public.appointments
  where doctor_id = p_doctor and visit_date = p_date and status <> 'cancelled';
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.taken_slots(uuid, text) to anon, authenticated;

alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "doctors_read" on public.doctors;
drop policy if exists "doctors_admin_insert" on public.doctors;
drop policy if exists "doctors_admin_update" on public.doctors;
drop policy if exists "doctors_admin_delete" on public.doctors;
create policy "doctors_read" on public.doctors for select using (true);
create policy "doctors_admin_insert" on public.doctors for insert to authenticated with check (public.is_admin());
create policy "doctors_admin_update" on public.doctors for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "doctors_admin_delete" on public.doctors for delete to authenticated using (public.is_admin());

drop policy if exists "appointments_public_insert" on public.appointments;
drop policy if exists "appointments_admin_read" on public.appointments;
drop policy if exists "appointments_admin_update" on public.appointments;
drop policy if exists "appointments_admin_delete" on public.appointments;
create policy "appointments_public_insert" on public.appointments for insert to anon, authenticated with check (status = 'new');
create policy "appointments_admin_read" on public.appointments for select to authenticated using (public.is_admin());
create policy "appointments_admin_update" on public.appointments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "appointments_admin_delete" on public.appointments for delete to authenticated using (public.is_admin());

drop policy if exists "admins_read_own" on public.admins;
create policy "admins_read_own" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "settings_read" on public.site_settings;
drop policy if exists "settings_admin_insert" on public.site_settings;
drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_read" on public.site_settings for select using (true);
create policy "settings_admin_insert" on public.site_settings for insert to authenticated with check (public.is_admin());
create policy "settings_admin_update" on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "images_public_read" on storage.objects;
drop policy if exists "images_admin_insert" on storage.objects;
drop policy if exists "images_admin_update" on storage.objects;
drop policy if exists "images_admin_delete" on storage.objects;
create policy "images_public_read" on storage.objects for select using (bucket_id = 'images');
create policy "images_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());
create policy "images_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'images' and public.is_admin());
create policy "images_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());
