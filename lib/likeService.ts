/**
 * likeService.ts
 * Handles likes on posts.
 *
 * SQL — run in Supabase SQL editor:
 *
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
 */

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Returns the number of likes for a post. Falls back to a random number if unconfigured. */
export async function getLikeCount(postId: string): Promise<number> {
  if (!isConfigured) return Math.floor(Math.random() * 280) + 20;
  const { supabase } = await import("@/lib/supabase");
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  return count ?? 0;
}

/** Returns true if the given user has liked the post. */
export async function getUserLike(postId: string, userId: string): Promise<boolean> {
  if (!isConfigured || !userId) return false;
  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/**
 * Toggles the like for (postId, userId).
 * Pass `currentlyLiked` so we know whether to INSERT or DELETE.
 * Returns the new liked state.
 */
export async function toggleLike(
  postId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  if (!isConfigured || !userId) return !currentlyLiked; // optimistic only
  const { supabase } = await import("@/lib/supabase");
  if (currentlyLiked) {
    await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId);
    return false;
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: userId });
    return true;
  }
}
