export interface Comment {
  id:         string;
  created_at: string;
  post_id:    string;
  user_id:    string;
  content:    string;
  author:     string;
  avatar:     string;
}

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Fetch all comments for a post, ordered oldest first. */
export async function getComments(postId: string): Promise<Comment[]> {
  if (!isConfigured) return [];
  const { supabase } = await import("@/lib/supabase");

  // Fetch comments and profiles separately to avoid FK join issues
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const userIds = [...new Set(data.map((c: { user_id: string }) => c.user_id).filter(Boolean))];
  let profilesMap: Record<string, { name?: string; username?: string; avatar_url?: string }> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, username, avatar_url")
      .in("id", userIds);
    if (profiles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((row: any) => {
    const profile = profilesMap[row.user_id];
    return {
      id:         row.id,
      created_at: row.created_at,
      post_id:    row.post_id,
      user_id:    row.user_id,
      content:    row.content,
      author:     profile?.username ?? profile?.name ?? "Anonyme",
      avatar:     profile?.avatar_url ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${row.user_id}`,
    };
  });
}

/** Insert a new comment. */
export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment | null> {
  if (!isConfigured || !userId) return null;
  const { supabase } = await import("@/lib/supabase");

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: userId, content })
    .select("*")
    .single();

  if (error || !data) return null;

  // Fetch author profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, username, avatar_url")
    .eq("id", userId)
    .single();

  return {
    id:         data.id,
    created_at: data.created_at,
    post_id:    data.post_id,
    user_id:    data.user_id,
    content:    data.content,
    author:     profile?.username ?? profile?.name ?? "Moi",
    avatar:     profile?.avatar_url ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${userId}`,
  };
}
