import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/*
 * ════════════════════════════════════════════════
 *  Fast. — Supabase SQL Setup
 *  Run each block in the Supabase SQL editor.
 * ════════════════════════════════════════════════
 *
 * 1. PROFILES TABLE
 * -----------------
 * create table profiles (
 *   id         uuid references auth.users(id) on delete cascade primary key,
 *   created_at timestamptz default now(),
 *   name       text,
 *   username   text unique,
 *   bio        text,
 *   avatar_url varchar(500)
 * );
 * alter table profiles enable row level security;
 * create policy "Public read"  on profiles for select using (true);
 * create policy "Owner insert" on profiles for insert with check (auth.uid() = id);
 * create policy "Owner update" on profiles for update using (auth.uid() = id);
 *
 * -- Auto-create blank profile on signup:
 * create or replace function handle_new_user()
 * returns trigger language plpgsql security definer as $$
 * begin
 *   insert into profiles (id) values (new.id);
 *   return new;
 * end;
 * $$;
 * create trigger on_auth_user_created
 *   after insert on auth.users
 *   for each row execute procedure handle_new_user();
 *
 * 2. POSTS TABLE
 * --------------
 * create table posts (
 *   id         uuid default gen_random_uuid() primary key,
 *   created_at timestamptz default now(),
 *   user_id    uuid references auth.users(id) on delete cascade,
 *   title      text not null,
 *   theme      varchar(50) not null,
 *   score      numeric(3,1) not null check (score >= 0 and score <= 10),
 *   comment    text,
 *   photo_url  varchar(500) not null,
 *   lat        double precision,
 *   lng        double precision
 * );
 * alter table posts enable row level security;
 * create policy "Public read"  on posts for select using (true);
 * create policy "Auth insert"  on posts for insert with check (auth.uid() = user_id);
 * create policy "Auth delete"  on posts for delete using (auth.uid() = user_id);
 *
 * 3. LIKES TABLE
 * ---------------
 * create table likes (
 *   id         uuid default gen_random_uuid() primary key,
 *   created_at timestamptz default now(),
 *   user_id    uuid references auth.users(id) on delete cascade not null,
 *   post_id    uuid references posts(id) on delete cascade not null,
 *   unique(user_id, post_id)
 * );
 * alter table likes enable row level security;
 * create policy "Public read"  on likes for select using (true);
 * create policy "Auth insert"  on likes for insert with check (auth.uid() = user_id);
 * create policy "Auth delete"  on likes for delete using (auth.uid() = user_id);
 *
 * 4. COMMENTS TABLE
 * -----------------
 * create table comments (
 *   id         uuid default gen_random_uuid() primary key,
 *   created_at timestamptz default now(),
 *   post_id    uuid references posts(id) on delete cascade not null,
 *   user_id    uuid references auth.users(id) on delete cascade not null,
 *   content    text not null
 * );
 * alter table comments enable row level security;
 * create policy "Public read"  on comments for select using (true);
 * create policy "Auth insert"  on comments for insert with check (auth.uid() = user_id);
 * create policy "Auth delete"  on comments for delete using (auth.uid() = user_id);
 *
 * 5. STORAGE BUCKETS
 * ------------------
 * -- A) Public bucket "post-photos" (for post images)
 * --    Policy: authenticated users can INSERT to path {user_id}/*
 * -- B) Public bucket "avatars" (for profile photos)
 * --    Policy: authenticated users can UPSERT to path {user_id}/avatar.*
 */
