"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { upsertProfile, uploadAvatar } from "@/lib/profileService";

export interface ProfileData {
  id:         string;
  name:       string;
  username:   string;
  bio:        string;
  avatar_url: string;
}

interface ProfileHeaderProps {
  profile: ProfileData;
  onUpdate: (updated: ProfileData) => void;
  postCount: number;
  avgScore: string;
  followerCount?: number;
  followingCount?: number;
  onClickFollowers?: () => void;
  onClickFollowing?: () => void;
}

export default function ProfileHeader({
  profile,
  onUpdate,
  postCount,
  avgScore,
  followerCount = 0,
  followingCount = 0,
  onClickFollowers,
  onClickFollowing,
}: ProfileHeaderProps) {
  const [editing, setEditing]           = useState(false);
  const [draft, setDraft]               = useState<ProfileData>(profile);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]     = useState<File | null>(null);
  const [saving, setSaving]             = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const openEdit = () => {
    setDraft({ ...profile });
    setAvatarPreview(null);
    setAvatarFile(null);
    setEditing(true);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatar_url = draft.avatar_url;

      // Upload new avatar if one was chosen
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile, profile.id);
        if (uploaded) avatar_url = uploaded;
        else avatar_url = avatarPreview ?? draft.avatar_url; // local blob fallback
      }

      const updated: ProfileData = { ...draft, avatar_url };

      // Persist to Supabase (no-op if unconfigured)
      await upsertProfile({
        id:         updated.id,
        name:       updated.name,
        username:   updated.username.replace("@", ""),
        bio:        updated.bio,
        avatar_url: updated.avatar_url,
      });

      onUpdate(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ── Cover ── */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-indigo-900/60 via-violet-900/30 to-zinc-900" />

        {/* Avatar */}
        <div className="absolute bottom-0 left-4 translate-y-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-20 h-20 rounded-2xl border-4 border-zinc-950 bg-zinc-800 object-cover"
          />
        </div>

        {/* Edit button — login required */}
        <div className="absolute top-4 right-4">
          {profile.id ? (
            <button
              onClick={openEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-xs font-semibold transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Modifier
            </button>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 backdrop-blur-sm border border-indigo-500/40 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              🔐 Se connecter
            </Link>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-4 pt-14 pb-4 space-y-3">
        <div>
          <h1 className="text-xl font-black text-white">{profile.name || "Anonyme"}</h1>
          <p className="text-zinc-500 text-sm">{profile.username}</p>
        </div>
        {profile.bio && <p className="text-zinc-300 text-sm leading-relaxed">{profile.bio}</p>}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Notes",       value: postCount || "—",                          onClick: undefined },
            { label: "Abonnés",     value: followerCount,                             onClick: onClickFollowers },
            { label: "Abonnements", value: followingCount,                            onClick: onClickFollowing },
            { label: "Moy.",        value: avgScore !== "—" ? `${avgScore}/10` : "—", onClick: undefined },
          ].map((s) => (
            <div
              key={s.label}
              onClick={s.onClick}
              className={`bg-zinc-900 border border-zinc-800 rounded-xl py-3 text-center transition-colors ${
                s.onClick ? "cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-800" : ""
              }`}
            >
              <div className="text-lg font-black text-indigo-400">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ EDIT SHEET ══ */}
      {editing && (
        <>
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[55]"
            onClick={() => !saving && setEditing(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-zinc-900 border-t border-zinc-700/60 rounded-t-3xl px-5 pt-3 pb-8">
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-zinc-600 mx-auto mb-5" />
            <h2 className="text-lg font-black text-white mb-5">Modifier le profil</h2>

            {/* Avatar picker */}
            <div className="flex items-center gap-4 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview ?? draft.avatar_url}
                alt="avatar"
                className="w-16 h-16 rounded-2xl object-cover bg-zinc-800 border-2 border-zinc-700 shrink-0"
              />
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-600 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-colors"
              >
                📷 Changer la photo
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5 mb-3">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nom</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5 mb-3">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm select-none">@</span>
                <input
                  type="text"
                  value={draft.username.replace("@", "")}
                  onChange={(e) =>
                    setDraft({ ...draft, username: `@${e.target.value.replace("@", "")}` })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5 mb-5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bio</label>
              <textarea
                rows={2}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 font-semibold text-sm disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
