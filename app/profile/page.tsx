"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProfileHeader, { ProfileData } from "@/components/ProfileHeader";
import { useApp } from "@/lib/AppContext";
import { getProfile } from "@/lib/profileService";
import { THEME_META } from "@/lib/mockData";

const GUEST_PROFILE: ProfileData = {
  id:         "",
  name:       "Invité",
  username:   "@moi",
  bio:        "",
  avatar_url: "https://api.dicebear.com/7.x/thumbs/svg?seed=guest",
};

export default function ProfilePage() {
  const { ratings, currentUser } = useApp();
  const [profile, setProfile] = useState<ProfileData>(GUEST_PROFILE);

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
    ? ratings.filter((r) => r.user_id === currentUser.id).slice(0, 6)
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
            Mes notes récentes
          </h2>
          {myRatings.map((r) => {
            const meta = THEME_META[r.theme];
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3"
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
              </div>
            );
          })}
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
