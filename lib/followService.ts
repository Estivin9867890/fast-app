/**
 * followService.ts
 * Manages the social graph (follow / unfollow).
 *
 * SQL — run in Supabase SQL editor:
 *
 * create table follows (
 *   follower_id  uuid references auth.users(id) on delete cascade,
 *   following_id uuid references auth.users(id) on delete cascade,
 *   created_at   timestamptz default now(),
 *   primary key (follower_id, following_id)
 * );
 *
 * alter table follows enable row level security;
 *
 * -- Anyone can read the follow graph (needed for feed filtering)
 * create policy "Public read"   on follows for select using (true);
 * -- Only the follower can insert their own row
 * create policy "Owner insert"  on follows for insert with check (auth.uid() = follower_id);
 * -- Only the follower can delete their own row
 * create policy "Owner delete"  on follows for delete using (auth.uid() = follower_id);
 */

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Follow a user. Returns true on success. */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!isConfigured || followerId === followingId) return false;

  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) {
    console.error("[followService] followUser error:", error.message);
    return false;
  }
  return true;
}

/** Unfollow a user. Returns true on success. */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!isConfigured) return false;

  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) {
    console.error("[followService] unfollowUser error:", error.message);
    return false;
  }
  return true;
}

/** Check if follower is already following target. */
export async function isFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!isConfigured) return false;

  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  return !!data;
}

/** Get all user IDs that the given user is following. */
export async function getFollowingIds(userId: string): Promise<string[]> {
  if (!isConfigured) return [];

  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  return (data ?? []).map((row: { following_id: string }) => row.following_id);
}

/** Number of people who follow this user. */
export async function getFollowerCount(userId: string): Promise<number> {
  if (!isConfigured) return 0;

  const { supabase } = await import("@/lib/supabase");
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  return count ?? 0;
}

/** Number of people this user is following. */
export async function getFollowingCount(userId: string): Promise<number> {
  if (!isConfigured) return 0;

  const { supabase } = await import("@/lib/supabase");
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  return count ?? 0;
}
