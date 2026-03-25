"use client";

import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { THEMES, THEME_META, Theme } from "@/lib/mockData";
import { useApp } from "@/lib/AppContext";

export default function ThemesPage() {
  const router = useRouter();
  const { ratings, activeTheme, setActiveTheme } = useApp();

  const countByTheme = (theme: Theme) => ratings.filter((r) => r.theme === theme).length;

  const avgByTheme = (theme: Theme) => {
    const items = ratings.filter((r) => r.theme === theme);
    if (!items.length) return null;
    return (items.reduce((s, r) => s + r.score, 0) / items.length).toFixed(1);
  };

  const handleThemeClick = (theme: Theme) => {
    setActiveTheme(theme);
    router.push("/feed");
  };

  const handleShowAll = () => {
    setActiveTheme("all");
    router.push("/feed");
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Thèmes</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Filtre le feed par catégorie</p>
        </div>
        {activeTheme !== "all" && (
          <button
            onClick={handleShowAll}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Tout voir ✕
          </button>
        )}
      </div>

      <div className="px-4 space-y-2.5">
        {THEMES.map((theme) => {
          const meta = THEME_META[theme];
          const count = countByTheme(theme);
          const avg = avgByTheme(theme);
          const isActive = activeTheme === theme;
          const topTitles = ratings
            .filter((r) => r.theme === theme)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((r) => r.title);

          return (
            <button
              key={theme}
              onClick={() => handleThemeClick(theme)}
              className="w-full rounded-2xl overflow-hidden relative group text-left transition-transform active:scale-[0.98]"
              style={{
                outline: isActive ? `2px solid ${meta.color}` : "none",
                outlineOffset: "0px",
              }}
            >
              {/* Cover photo */}
              <div className="relative h-28 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={meta.cover}
                  alt={theme}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 p-4 flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-lg"
                  style={{
                    background: `${meta.color}35`,
                    border: `1.5px solid ${meta.color}55`,
                  }}
                >
                  {meta.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-black text-white text-base leading-tight">{theme}</h2>
                    {isActive && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${meta.color}30`, color: meta.color }}
                      >
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-white/45 text-xs mt-0.5">
                    {count} note{count > 1 ? "s" : ""}
                    {avg && (
                      <span style={{ color: meta.color }} className="ml-2 font-semibold">
                        moy. {avg}/10
                      </span>
                    )}
                  </p>
                  {topTitles.length > 0 && (
                    <p className="text-white/30 text-xs mt-0.5 truncate">{topTitles.join(" · ")}</p>
                  )}
                </div>

                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    background: isActive ? `${meta.color}30` : "rgba(255,255,255,0.05)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18l6-6-6-6"
                      stroke={isActive ? meta.color : "rgba(255,255,255,0.3)"}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
