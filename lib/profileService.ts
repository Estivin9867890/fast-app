/**
 * profileService.ts
 * Handles upsert / select for the `profiles` table.
 *
 * SQL — run in Supabase SQL editor:
 *
 * create table profiles (
 *   id          uuid references auth.users(id) on delete cascade primary key,
 *   created_at  timestamptz default now(),
 *   name        text,
 *   username    text unique,
 *   bio         text,
 *   avatar_url  varchar(500)
 * );
 *
 * alter table profiles enable row level security;
 *
 * -- Anyone can read profiles (for author display in posts)
 * create policy "Public read"  on profiles for select using (true);
 * -- Only the owner can update their own profile
 * create policy "Owner upsert" on profiles for insert with check (auth.uid() = id);
 * create policy "Owner update" on profiles for update using (auth.uid() = id);
 *
 * -- Auto-create a blank profile row on signup:
 * create or replace function handle_new_user()
 * returns trigger language plpgsql security definer as $$
 * begin
 *   insert into profiles (id) values (new.id);
 *   return new;
 * end;
 * $$;
 *
 * create trigger on_auth_user_created
 *   after insert on auth.users
 *   for each row execute procedure handle_new_user();
 */

export interface UserProfile {
  id:         string;
  name:       string;
  username:   string;
  bio:        string;
  avatar_url: string;
}

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Fetch a profile by user ID.
 * Returns null if not found or Supabase is unconfigured.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (!isConfigured) return null;

  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

/**
 * Upsert profile data (merge with existing row).
 * Returns the updated profile or null on failure.
 */
export async function upsertProfile(
  profile: Partial<UserProfile> & { id: string }
): Promise<UserProfile | null> {
  if (!isConfigured) {
    console.warn("[profileService] Supabase not configured — add .env.local keys.");
    return null;
  }
  if (!profile.id) {
    console.warn("[profileService] No user id — user must be logged in to save profile.");
    return null;
  }

  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("[profileService] upsertProfile error:", error.message);
    return null;
  }
  return data as UserProfile;
}

/**
 * Upload a new avatar to Supabase Storage and return its public URL.
 */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  if (!isConfigured) return null;

  const { supabase } = await import("@/lib/supabase");
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("[profileService] uploadAvatar error:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
