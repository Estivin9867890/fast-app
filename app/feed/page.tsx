"use client";

import { useRouter } from "next/navigation";
import FeedSlide from "@/components/FeedSlide";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/lib/AppContext";
import { Rating, THEME_META } from "@/lib/mockData";

export default function FeedPage() {
  const router = useRouter();
  const { ratings, activeTheme, setActiveTheme } = useApp();

  const filtered =
    activeTheme === "all" ? ratings : ratings.filter((r) => r.theme === activeTheme);

  const handleMapClick = (rating: Rating) => {
    router.push(`/map?id=${rating.id}&lat=${rating.lat}&lng=${rating.lng}`);
  };

  return (
    <div className="bg-zinc-950">
      {/* Theme filter strip — fixed over the feed */}
      {activeTheme !== "all" && (
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={() => setActiveTheme("all")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white/80 text-xs font-semibold hover:text-white transition-colors"
              style={{ borderColor: `${THEME_META[activeTheme as keyof typeof THEME_META]?.color}50` }}
            >
              ← {activeTheme === "all" ? "Tout" : activeTheme}
              <span className="text-white/40">✕</span>
            </button>
          </div>
        </div>
      )}

      <div className="feed-scroll">
        {filtered.length > 0 ? (
          filtered.map((rating) => (
            <FeedSlide key={rating.id} rating={rating} onMapClick={handleMapClick} />
          ))
        ) : (
          <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
            <span className="text-5xl">🔍</span>
            <p className="text-zinc-400 font-semibold">
              Aucune note pour le thème &ldquo;{activeTheme}&rdquo;
            </p>
            <button
              onClick={() => setActiveTheme("all")}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold"
            >
              Voir tout
            </button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
