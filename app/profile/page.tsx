"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProfileHeader, { ProfileData } from "@/components/ProfileHeader";
import { useApp } from "@/lib/AppContext";
import { getProfile } from "@/lib/profileService";
import { THEME_META, Rating, THEMES, Theme } from "@/lib/mockData";

const GUEST_PROFILE: ProfileData = {
  id:         "",
  name:       "Invité",
  username:   "@moi",
  bio:        "",
  avatar_url: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
};

type PostModal =
  | { type: "view"; rating: Rating }
  | { type: "edit"; rating: Rating; title: string; score: number; theme: Theme }
  | { type: "confirmDelete"; rating: Rating }
  | null;

export default function ProfilePage() {
  const { ratings, currentUser, deleteRating, updateRating } = useApp();
  const [profile, setProfile] = useState<ProfileData>(GUEST_PROFILE);
  const [postModal, setPostModal] = useState<PostModal>(null);
  const [saving, setSaving] = useState(false);

  // Load real profile when user is logged in
  useEffect(() => {
    if (!currentUser) {
      setProfile(GUEST_PROFILE);
      return;
    }
    getProfile(currentUser.id).then((p) => {
      if (p) {
        setProfile({
          id:         p.id,
          name:       p.name ?? "",
          username:   p.username ? `@${p.username}` : "",
          bio:        p.bio ?? "",
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/thumbs/svg?seed=${p.id}`,
        });
      } else {
        // Logged in but no profile row yet
        setProfile({
          id:         currentUser.id,
          name:       "",
          username:   "",
          bio:        "",
          avatar_url: `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentUser.id}`,
        });
      }
    });
  }, [currentUser]);

  const myRatings = currentUser
    ? ratings.filter((r) => r.user_id === currentUser.id)
    : [];
  const avgScore = myRatings.length
    ? (myRatings.reduce((s, r) => s + r.score, 0) / myRatings.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <ProfileHeader
        profile={profile}
        onUpdate={setProfile}
        postCount={myRatings.length}
        avgScore={avgScore}
      />

      {/* Auth CTA — only shown when not logged in */}
      {!currentUser && (
        <div className="px-4 pb-4">
          <Link
            href="/auth"
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            🔐 Connexion pour sauvegarder votre profil
          </Link>
        </div>
      )}

      {/* My ratings */}
      {myRatings.length > 0 && (
        <div className="px-4 space-y-2.5">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Mes notes
          </h2>
          {myRatings.map((r) => {
            const meta = THEME_META[r.theme];
            return (
              <button
                key={r.id}
                onClick={() => setPostModal({ type: "view", rating: r })}
                className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-left hover:border-zinc-600 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.photo_url}
                  alt={r.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{r.title}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${meta.color}18`, color: meta.color }}
                  >
                    {meta.emoji} {r.theme}
                  </span>
                </div>
                <div
                  className={`text-xl font-black shrink-0 ${
                    r.score >= 8 ? "text-green-400" : r.score >= 5 ? "text-amber-400" : "text-red-400"
                  }`}
                >
                  {r.score}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Post modal (view / edit / confirm delete) ── */}
      {postModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setPostModal(null); }}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl overflow-hidden"
            style={{ background: "rgb(18,18,20)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {/* ── VIEW mode ── */}
            {postModal.type === "view" && (() => {
              const r = postModal.rating;
              const meta = THEME_META[r.theme];
              return (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.photo_url} alt={r.title} className="w-full h-44 object-cover" />
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-white">{r.title}</h3>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${meta.color}18`, color: meta.color }}
                        >
                          {meta.emoji} {r.theme}
                        </span>
                      </div>
                      <span
                        className={`text-3xl font-black shrink-0 ${
                          r.score >= 8 ? "text-green-400" : r.score >= 5 ? "text-amber-400" : "text-red-400"
                        }`}
                      >
                        {r.score}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-zinc-400 text-sm">&ldquo;{r.comment}&rdquo;</p>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          setPostModal({
                            type: "edit",
                            rating: r,
                            title: r.title,
                            score: r.score,
                            theme: r.theme,
                          })
                        }
                        className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => setPostModal({ type: "confirmDelete", rating: r })}
                        className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-red-900/40 border border-zinc-700 hover:border-red-500/40 text-zinc-300 hover:text-red-400 font-bold text-sm transition-colors"
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                    <button
                      onClick={() => setPostModal(null)}
                      className="w-full py-2.5 rounded-xl text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ── EDIT mode ── */}
            {postModal.type === "edit" && (() => {
              const r = postModal.rating;
              return (
                <div className="px-5 py-5 space-y-4">
                  <h3 className="text-base font-black text-white">Modifier la note</h3>

                  {/* Title */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Titre</label>
                    <input
                      type="text"
                      value={postModal.title}
                      onChange={(e) => setPostModal({ ...postModal, title: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Score */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-end">
                      <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Note</label>
                      <span
                        className={`text-2xl font-black ${
                          postModal.score >= 8 ? "text-green-400" : postModal.score >= 5 ? "text-amber-400" : "text-red-400"
                        }`}
                      >
                        {postModal.score}/10
                      </span>
                    </div>
                    <input
                      type="range" min={0} max={10}
                      value={postModal.score}
                      onChange={(e) => setPostModal({ ...postModal, score: Number(e.target.value) })}
                      className="w-full h-2 cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Theme */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Thème</label>
                    <div className="grid grid-cols-2 gap-2">
                      {THEMES.map((theme) => {
                        const m = THEME_META[theme];
                        const selected = postModal.theme === theme;
                        return (
                          <button
                            key={theme}
                            type="button"
                            onClick={() => setPostModal({ ...postModal, theme })}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border"
                            style={{
                              background: selected ? `${m.color}15` : "rgb(24,24,27)",
                              borderColor: selected ? m.color : "rgb(63,63,70)",
                              color: selected ? "white" : "rgb(161,161,170)",
                            }}
                          >
                            <span>{m.emoji}</span>
                            <span className="truncate">{theme}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={async () => {
                        setSaving(true);
                        await updateRating(r.id, {
                          title: postModal.title,
                          score: postModal.score,
                          theme: postModal.theme,
                        });
                        setSaving(false);
                        setPostModal(null);
                      }}
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                    >
                      {saving ? "Sauvegarde…" : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => setPostModal({ type: "view", rating: r })}
                      className="px-5 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ── CONFIRM DELETE mode ── */}
            {postModal.type === "confirmDelete" && (() => {
              const r = postModal.rating;
              return (
                <div className="px-5 py-6 space-y-4 text-center">
                  <div className="text-4xl">🗑</div>
                  <h3 className="text-lg font-black text-white">Supprimer cette note ?</h3>
                  <p className="text-zinc-400 text-sm">
                    &ldquo;<span className="text-white font-semibold">{r.title}</span>&rdquo; sera définitivement supprimé.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setSaving(true);
                        await deleteRating(r.id, r.photo_url);
                        setSaving(false);
                        setPostModal(null);
                      }}
                      disabled={saving}
                      className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                    >
                      {saving ? "Suppression…" : "Supprimer"}
                    </button>
                    <button
                      onClick={() => setPostModal({ type: "view", rating: r })}
                      className="flex-1 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Empty state for logged-in users with no posts yet */}
      {currentUser && myRatings.length === 0 && (
        <div className="px-4 py-10 text-center space-y-3">
          <p className="text-zinc-500 text-sm">Tu n&apos;as pas encore de notes.</p>
          <Link
            href="/create"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-black transition-colors"
          >
            + Créer une note
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
