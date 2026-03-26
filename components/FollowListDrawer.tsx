"use client";

import Link from "next/link";
import { FollowUser } from "@/lib/followService";

interface FollowListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  loading: boolean;
  /** If true, show an unfollow button next to each user */
  canUnfollow?: boolean;
  onUnfollow?: (userId: string) => void;
  unfollowingId?: string | null;
}

export default function FollowListDrawer({
  isOpen,
  onClose,
  title,
  users,
  loading,
  canUnfollow,
  onUnfollow,
  unfollowingId,
}: FollowListDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg flex flex-col"
        style={{
          background: "rgb(18,18,20)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "22px 22px 0 0",
          maxHeight: "75vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-zinc-700" />
            <span className="font-black text-white text-base ml-2">{title}</span>
            {!loading && (
              <span className="text-zinc-500 text-sm font-normal">({users.length})</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ scrollbarWidth: "none" }}>
          {loading ? (
            <p className="text-zinc-500 text-sm text-center py-8 animate-pulse">Chargement…</p>
          ) : users.length === 0 ? (
            <p className="text-zinc-600 text-sm text-center py-8">Aucun utilisateur.</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-zinc-800/50 transition-colors"
              >
                {/* Avatar + name → clickable link */}
                <Link
                  href={`/profile/${user.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-11 h-11 rounded-full bg-zinc-800 object-cover shrink-0 border border-zinc-700"
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {user.name || "Utilisateur"}
                    </p>
                    {user.username && (
                      <p className="text-zinc-500 text-xs truncate">@{user.username}</p>
                    )}
                  </div>
                </Link>

                {/* Unfollow button */}
                {canUnfollow && (
                  <button
                    onClick={() => onUnfollow?.(user.id)}
                    disabled={unfollowingId === user.id}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                    style={{
                      background: "rgb(39,39,42)",
                      border: "1px solid rgb(63,63,70)",
                      color: "rgb(161,161,170)",
                      minWidth: "110px",
                    }}
                  >
                    {unfollowingId === user.id ? "…" : "Se désabonner"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom safe area */}
        <div className="h-6" />
      </div>
    </div>
  );
}
