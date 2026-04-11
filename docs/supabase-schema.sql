-- ─────────────────────────────────────────────────────────────────
--  SOWO DATABASE SCHEMA
--  Run this in Supabase → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────
--  PROFILES  (one per user, extends auth.users)
-- ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  full_name    text,
  avatar_url   text,
  phone        text,
  location     text,
  is_provider  boolean default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
--  PROVIDERS  (one per provider, references profiles)
-- ─────────────────────────────────────────────────────────────────
create table public.providers (
  id                uuid references public.profiles on delete cascade primary key,
  bio               text,
  category          text not null,
  skills            text[],
  hourly_rate       integer,           -- in pence (e.g. 2500 = £25.00)
  available         boolean default true,
  verified          boolean default false,
  vouch_count       integer default 0,
  rating            numeric(3,2) default 0,
  portfolio_images  text[],
  years_experience  integer default 0,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────
--  SERVICES  (what providers offer, with prices)
-- ─────────────────────────────────────────────────────────────────
create table public.services (
  id               uuid default gen_random_uuid() primary key,
  provider_id      uuid references public.providers on delete cascade not null,
  name             text not null,
  description      text,
  price            integer not null,   -- in pence
  duration_hours   numeric(4,1),
  created_at       timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────
--  BOOKINGS
-- ─────────────────────────────────────────────────────────────────
create table public.bookings (
  id                        uuid default gen_random_uuid() primary key,
  consumer_id               uuid references public.profiles not null,
  provider_id               uuid references public.providers not null,
  service_id                uuid references public.services,
  status                    text default 'pending'
                              check (status in ('pending','confirmed','in_progress','completed','cancelled')),
  date                      date,
  time                      time,
  message                   text,
  total_amount              integer,   -- in pence
  stripe_payment_intent_id  text,
  stripe_checkout_session_id text,
  paid_at                   timestamptz,
  created_at                timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────
--  VOUCHES / REVIEWS
-- ─────────────────────────────────────────────────────────────────
create table public.vouches (
  id           uuid default gen_random_uuid() primary key,
  author_id    uuid references public.profiles not null,
  provider_id  uuid references public.providers not null,
  booking_id   uuid references public.bookings,
  rating       integer check (rating between 1 and 5),
  text         text,
  created_at   timestamptz default now(),
  unique(author_id, booking_id)   -- one vouch per booking
);

-- ─────────────────────────────────────────────────────────────────
--  MESSAGES  (optional — simple in-app messaging)
-- ─────────────────────────────────────────────────────────────────
create table public.messages (
  id          uuid default gen_random_uuid() primary key,
  booking_id  uuid references public.bookings not null,
  sender_id   uuid references public.profiles not null,
  body        text not null,
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────────

-- Profiles: anyone can read, only owner can write
alter table public.profiles enable row level security;
create policy "Profiles are publicly readable"  on public.profiles for select  using (true);
create policy "Users can insert own profile"     on public.profiles for insert  with check (auth.uid() = id);
create policy "Users can update own profile"     on public.profiles for update  using (auth.uid() = id);

-- Providers: anyone can read, only owner can write
alter table public.providers enable row level security;
create policy "Providers are publicly readable"  on public.providers for select  using (true);
create policy "Providers can insert own record"  on public.providers for insert  with check (auth.uid() = id);
create policy "Providers can update own record"  on public.providers for update  using (auth.uid() = id);

-- Services: anyone can read, only provider owner can write
alter table public.services enable row level security;
create policy "Services are publicly readable"   on public.services  for select  using (true);
create policy "Provider can manage own services" on public.services  for all     using (auth.uid() = provider_id);

-- Bookings: consumers and providers can see their own
alter table public.bookings enable row level security;
create policy "Consumer sees own bookings"   on public.bookings for select using (auth.uid() = consumer_id);
create policy "Provider sees own bookings"   on public.bookings for select using (auth.uid() = provider_id);
create policy "Consumer creates booking"     on public.bookings for insert with check (auth.uid() = consumer_id);
create policy "Provider updates status"      on public.bookings for update using (auth.uid() = provider_id);

-- Vouches: anyone can read, only author can write
alter table public.vouches enable row level security;
create policy "Vouches are publicly readable"   on public.vouches for select  using (true);
create policy "Authenticated users can vouch"   on public.vouches for insert  with check (auth.uid() = author_id);

-- Messages: only booking participants can read/write
alter table public.messages enable row level security;
create policy "Booking participants can read messages"
  on public.messages for select
  using (
    auth.uid() = sender_id or
    auth.uid() in (
      select consumer_id from public.bookings where id = booking_id
      union
      select provider_id from public.bookings where id = booking_id
    )
  );
create policy "Booking participants can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- ─────────────────────────────────────────────────────────────────
--  STORAGE BUCKET  (for avatars and portfolio images)
-- ─────────────────────────────────────────────────────────────────
-- Run manually in Supabase Storage tab → New bucket → name: "media" → Public

-- ─────────────────────────────────────────────────────────────────
--  INDEXES  (for performance)
-- ─────────────────────────────────────────────────────────────────
create index on public.providers (category);
create index on public.providers (available);
create index on public.providers (vouch_count desc);
create index on public.bookings  (consumer_id);
create index on public.bookings  (provider_id);
create index on public.vouches   (provider_id);
create index on public.messages  (booking_id);

-- ─────────────────────────────────────────────────────────────────
--  SAMPLE DATA  (optional — uncomment to seed the DB for testing)
-- ─────────────────────────────────────────────────────────────────
/*
-- You'll need to create auth users first, then insert matching profiles.
-- The easiest way to test is to sign up via the app and then promote
-- a profile to provider via:

update public.profiles set is_provider = true where id = 'your-user-uuid';
insert into public.providers (id, bio, category, skills, hourly_rate, available)
values (
  'your-user-uuid',
  'Experienced plumber with 10 years in London. Available 7 days a week.',
  'Plumber',
  ARRAY['Leaks', 'Boilers', 'Bathrooms', 'Emergency callouts'],
  4500,
  true
);
insert into public.services (provider_id, name, description, price, duration_hours)
values
  ('your-user-uuid', 'Basic plumbing inspection', 'Full inspection + written report', 8000, 1.0),
  ('your-user-uuid', 'Leak repair',                'Find and fix any leak',            12000, 2.0),
  ('your-user-uuid', 'Full bathroom fit-out',      'Complete bathroom installation',   85000, 8.0);
*/
