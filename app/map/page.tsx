"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import BottomNav from "@/components/BottomNav";
import { useApp } from "@/lib/AppContext";
import { Rating, THEME_META, THEMES } from "@/lib/mockData";

const MapContainer = dynamic(() => import("@/components/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-900 rounded-2xl">
      <span className="text-zinc-500 text-sm animate-pulse">Chargement de la carte…</span>
    </div>
  ),
});

function MapContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { ratings, activeTheme, setActiveTheme } = useApp();
  const [focusedRating, setFocusedRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (id) {
      const found = ratings.find((r) => r.id === id);
      if (found) setFocusedRating(found);
    }
  }, [id, ratings]);

  const filtered =
    activeTheme === "all" ? ratings : ratings.filter((r) => r.theme === activeTheme);

  const themeOptions = ["all", ...THEMES] as const;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 pb-16">
      <div className="px-4 pt-12 pb-3 space-y-3">
        <h1 className="text-xl font-black text-white">Carte</h1>

        {/* Theme filter */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {themeOptions.map((t) => {
            const meta = t !== "all" ? THEME_META[t as keyof typeof THEME_META] : null;
            const active = activeTheme === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTheme(t)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                style={
                  active
                    ? {
                        background: meta ? `${meta.color}28` : "#4338ca",
                        borderColor: meta ? meta.color : "#6366f1",
                        color: "white",
                      }
                    : {
                        background: "rgb(24,24,27)",
                        borderColor: "rgb(63,63,70)",
                        color: "rgb(161,161,170)",
                      }
                }
              >
                {t === "all" ? "🗺 Tout" : `${meta?.emoji} ${t}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-4 pb-2 min-h-0">
        <MapContainer ratings={filtered} focusedRating={focusedRating} />
      </div>

      {focusedRating && (
        <div className="mx-4 mb-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={focusedRating.photo_url}
            alt={focusedRating.title}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{focusedRating.title}</p>
            <p className="text-xs text-zinc-500 truncate">{focusedRating.comment}</p>
          </div>
          <div
            className={`text-xl font-black shrink-0 ${
              focusedRating.score >= 8 ? "text-green-400" : focusedRating.score >= 5 ? "text-amber-400" : "text-red-400"
            }`}
          >
            {focusedRating.score}
            <span className="text-xs text-zinc-500">/10</span>
          </div>
          <button
            onClick={() => setFocusedRating(null)}
            className="text-zinc-600 hover:text-zinc-400 ml-1 text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default function MapPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
            Chargement…
          </div>
        }
      >
        <MapContent />
      </Suspense>
      <BottomNav />
    </>
  );
}
