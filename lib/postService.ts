import type { Rating } from "@/lib/mockData";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfileRow = { id: string; name?: string; username?: string; avatar_url?: string };

function mergePostWithProfile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any,
  profilesMap: Record<string, ProfileRow>
): Rating {
  const profile = row.user_id ? profilesMap[row.user_id] : undefined;
  return {
    id:         row.id,
    created_at: row.created_at,
    user_id:    row.user_id ?? "",
    title:      row.title,
    theme:      row.theme,
    score:      Number(row.score),
    comment:    row.comment ?? "",
    photo_url:  row.photo_url,
    lat:        row.lat ?? 48.8566,
    lng:        row.lng ?? 2.3522,
    author:     profile?.username ?? profile?.name ?? "Anonyme",
    avatar:     profile?.avatar_url ?? `https://api.dicebear.com/7.x/thumbs/svg?seed=${row.user_id}`,
  };
}

async function fetchProfilesMap(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userIds: string[]
): Promise<Record<string, ProfileRow>> {
  if (userIds.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .in("id", userIds);
  if (!data) return {};
  return Object.fromEntries((data as ProfileRow[]).map((p) => [p.id, p]));
}

/** Fetch all posts ordered by newest first. */
export async function getPosts(): Promise<Rating[]> {
  if (!isConfigured) {
    console.warn("[postService] Supabase not configured — using mock data.");
    return [];
  }

  const { supabase } = await import("@/lib/supabase");

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[postService] getPosts error:", error.message);
    return [];
  }
  if (!data || data.length === 0) return [];

  const userIds = [...new Set((data as { user_id: string }[]).map((r) => r.user_id).filter(Boolean))];
  const profilesMap = await fetchProfilesMap(supabase, userIds);

  return data.map((row: unknown) => mergePostWithProfile(row, profilesMap));
}

/** Insert a new post. Returns the created Rating or null on failure. */
export async function createPost(
  payload: Omit<Rating, "id" | "created_at" | "author" | "avatar">
): Promise<Rating | null> {
  if (!isConfigured) {
    console.warn("[postService] Supabase not configured — post not persisted.");
    return null;
  }

  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id:   payload.user_id || null,
      title:     payload.title,
      theme:     payload.theme,
      score:     payload.score,
      comment:   payload.comment,
      photo_url: payload.photo_url,
      lat:       payload.lat,
      lng:       payload.lng,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[postService] createPost error:", error.message);
    return null;
  }

  const profilesMap = await fetchProfilesMap(supabase, data.user_id ? [data.user_id] : []);
  return mergePostWithProfile(data, profilesMap);
}

/** Upload a photo to Supabase Storage and return its public URL. */
export async function uploadPostPhoto(file: File, userId: string): Promise<string> {
  if (!isConfigured) return URL.createObjectURL(file);

  const { supabase } = await import("@/lib/supabase");
  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("post-photos")
    .upload(path, file, { upsert: false });

  if (error) {
    console.error("[postService] uploadPhoto error:", error.message);
    return URL.createObjectURL(file);
  }

  const { data } = supabase.storage.from("post-photos").getPublicUrl(path);
  return data.publicUrl;
}
