"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Rating, mockRatings } from "@/lib/mockData";
import { getPosts, createPost, deletePost, updatePost } from "@/lib/postService";

interface AppState {
  ratings: Rating[];
  activeTheme: string;
  isLoading: boolean;
  currentUser: { id: string } | null;
  addRating: (r: Omit<Rating, "id" | "created_at" | "author" | "avatar"> & Partial<Rating>) => Promise<void>;
  deleteRating: (id: string, photoUrl?: string) => Promise<void>;
  updateRating: (id: string, updates: Partial<Pick<Rating, "title" | "score" | "theme" | "comment">>) => Promise<void>;
  setActiveTheme: (t: string) => void;
  refreshPosts: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Rating[]>(mockRatings);
  const [activeTheme, setActiveTheme] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Sync Supabase auth session
  useEffect(() => {
    const configured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    if (!configured) return;

    let sub: { unsubscribe: () => void } | null = null;
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        const u = data.user;
        console.log("[AppContext] getUser →", u ? u.email : "non connecté");
        setCurrentUser(u ? { id: u.id } : null);
        // Ensure profile row exists (backup if trigger failed)
        if (u) {
          supabase
            .from("profiles")
            .upsert({ id: u.id }, { onConflict: "id", ignoreDuplicates: true })
            .then();
        }
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        console.log("[AppContext] authChange →", user ? user.email : "déconnecté");
        setCurrentUser(user ? { id: user.id } : null);
      });
      sub = data.subscription;
    });
    return () => { sub?.unsubscribe(); };
  }, []);

  // Fetch from Supabase on mount; keep mockData as fallback
  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const remote = await getPosts();
      if (remote.length > 0) {
        // Merge remote posts with any locally-added ones (user_id === "me")
        setRatings((prev) => {
          const local = prev.filter((r) => r.user_id === "me");
          return [...local, ...remote];
        });
      }
      // If remote is empty (not configured or empty DB), keep mockData
    } catch (err) {
      console.warn("[AppContext] Could not fetch posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPosts();
  }, [refreshPosts]);

  const addRating = useCallback(
    async (
      payload: Omit<Rating, "id" | "created_at" | "author" | "avatar"> & Partial<Rating>
    ) => {
      // 1. Optimistic local insert (instant Feed + Map update)
      const optimistic: Rating = {
        id:         `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        author:     "Moi",
        avatar:     "https://api.dicebear.com/7.x/thumbs/svg?seed=me",
        lat:        48.8566,
        lng:        2.3522,
        ...payload,
      } as Rating;

      setRatings((prev) => [optimistic, ...prev]);

      // 2. Persist to Supabase (best-effort; fails silently when unconfigured)
      const saved = await createPost({
        user_id:   payload.user_id ?? "",
        title:     payload.title,
        theme:     payload.theme,
        score:     payload.score,
        comment:   payload.comment ?? "",
        photo_url: payload.photo_url,
        lat:       payload.lat,
        lng:       payload.lng,
      });

      // 3. Replace optimistic entry with server ID if save succeeded
      if (saved) {
        setRatings((prev) =>
          prev.map((r) => (r.id === optimistic.id ? saved : r))
        );
      }
    },
    []
  );

  const deleteRating = useCallback(async (id: string, photoUrl?: string) => {
    setRatings((prev) => prev.filter((r) => r.id !== id));
    await deletePost(id, photoUrl);
  }, []);

  const updateRating = useCallback(
    async (id: string, updates: Partial<Pick<Rating, "title" | "score" | "theme" | "comment">>) => {
      setRatings((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
      await updatePost(id, updates);
    },
    []
  );

  return (
    <AppContext.Provider
      value={{ ratings, activeTheme, isLoading, currentUser, addRating, deleteRating, updateRating, setActiveTheme, refreshPosts }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
