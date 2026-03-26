"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FeedSlide from "@/components/FeedSlide";
import FeedTabs, { FeedTab } from "@/components/FeedTabs";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/lib/AppContext";
import { Rating, THEME_META } from "@/lib/mockData";
import { getFollowingIds } from "@/lib/followService";

export default function FeedPage() {
  const router = useRouter();
  const { ratings, activeTheme, setActiveTheme, currentUser } = useApp();
  const [feedTab, setFeedTab] = useState<FeedTab>("pour-toi");
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // Optimistic update: add a new user to the following list immediately
  const handleFollowed = (userId: string) => {
    setFollowingIds((prev) => prev.includes(userId) ? prev : [...prev, userId]);
  };

  // Load following list when user is logged in
  useEffect(() => {
    if (currentUser?.id) {
      getFollowingIds(currentUser.id).then(setFollowingIds);
    } else {
      setFollowingIds([]);
    }
  }, [currentUser?.id]);

  // Theme filter first, then feed tab filter
  const themeFiltered =
    activeTheme === "all" ? ratings : ratings.filter((r) => r.theme === activeTheme);

  const filtered = (() => {
    if (feedTab === "pour-toi") return themeFiltered;
    if (!currentUser) return [];
    return themeFiltered.filter((r) => followingIds.includes(r.user_id));
  })();

  const handleMapClick = (rating: Rating) => {
    router.push(`/map?id=${rating.id}&lat=${rating.lat}&lng=${rating.lng}`);
  };

  const emptyMessage =
    feedTab === "amis" && !currentUser
      ? "Connecte-toi pour voir les posts de tes amis."
      : feedTab === "amis" && followingIds.length === 0
      ? "Tu ne suis personne encore. Abonne-toi à des utilisateurs !"
      : `Aucune note pour le thème "${activeTheme}"`;

  return (
    <div className="bg-zinc-950">
      {/* Dual feed tabs */}
      <FeedTabs active={feedTab} onChange={setFeedTab} />

      {/* Theme filter strip */}
      {activeTheme !== "all" && (
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto mt-16">
            <button
              onClick={() => setActiveTheme("all")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 text-xs font-semibold hover:text-white transition-colors"
              style={{ borderColor: `${THEME_META[activeTheme as keyof typeof THEME_META]?.color}50` }}
            >
              ← {activeTheme}
              <span className="text-white/40">✕</span>
            </button>
          </div>
        </div>
      )}

      <div className="feed-scroll">
        {filtered.length > 0 ? (
          filtered.map((rating) => (
            <FeedSlide
              key={rating.id}
              rating={rating}
              onMapClick={handleMapClick}
              followingIds={followingIds}
              onFollowed={handleFollowed}
            />
          ))
        ) : (
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
            <span className="text-5xl">{feedTab === "amis" ? "👥" : "🔍"}</span>
            <p className="text-zinc-400 font-semibold">{emptyMessage}</p>
            {feedTab === "amis" && (
              <button
                onClick={() => setFeedTab("pour-toi")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold"
              >
                Voir Pour toi
              </button>
            )}
            {feedTab === "pour-toi" && activeTheme !== "all" && (
              <button
                onClick={() => setActiveTheme("all")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold"
              >
                Voir tout
              </button>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
