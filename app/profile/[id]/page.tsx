"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { getProfile } from "@/lib/profileService";
import { getPostsByUser } from "@/lib/postService";
import { useApp } from "@/lib/AppContext";
import { THEME_META, Rating } from "@/lib/mockData";
import {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowerCount,
  getFollowingCount,
} from "@/lib/followService";

interface PublicProfile {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar_url: string;
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, ratings: allRatings } = useApp();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Redirect to /profile if viewing own profile
  useEffect(() => {
    if (currentUser?.id && currentUser.id === id) {
      router.replace("/profile");
    }
  }, [currentUser, id, router]);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      const [p, remotePosts, fCount, fgCount] = await Promise.all([
        getProfile(id as string),
        getPostsByUser(id as string),
        getFollowerCount(id as string),
        getFollowingCount(id as string),
      ]);
      setFollowerCount(fCount);
      setFollowingCount(fgCount);
      if (currentUser?.id) {
        isFollowing(currentUser.id, id as string).then(setFollowing);
      }

      if (p) {
        setProfile({
          id: p.id,
          name: p.name ?? "",
          username: p.username ? `@${p.username}` : "",
          bio: p.bio ?? "",
          avatar_url:
            p.avatar_url ||
            `https://api.dicebear.com/7.x/thumbs/svg?seed=${p.id}`,
        });
      } else {
        // Fallback: build from mock/context data
        const contextPost = allRatings.find((r) => r.user_id === id);
        if (contextPost) {
          setProfile({
            id: id as string,
            name: contextPost.author,
            username: "",
            bio: "",
            avatar_url: contextPost.avatar,
          });
        }
      }

      // Use remote posts if available, otherwise filter context
      if (remotePosts.length > 0) {
        setPosts(remotePosts);
      } else {
        setPosts(allRatings.filter((r) => r.user_id === id));
      }

      setLoading(false);
    }

    load();
  }, [id, allRatings]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !id) return;
    setFollowLoading(true);
    if (following) {
      await unfollowUser(currentUser.id, id as string);
      setFollowing(false);
      setFollowerCount((n) => Math.max(0, n - 1));
    } else {
      await followUser(currentUser.id, id as string);
      setFollowing(true);
      setFollowerCount((n) => n + 1);
    }
    setFollowLoading(false);
  };

  const avgScore =
    posts.length > 0
      ? (posts.reduce((s, r) => s + r.score, 0) / posts.length).toFixed(1)
      : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm animate-pulse">Chargement…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-zinc-400">Profil introuvable.</p>
        <Link href="/feed" className="text-indigo-400 text-sm font-semibold">
          ← Retour au feed
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      {/* Back button */}
      <div className="px-4 pt-12 pb-2">
        <button
          onClick={() => router.back()}
          className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 transition-colors"
        >
          ← Retour
        </button>
      </div>

      {/* Profile header */}
      <div className="px-4 pb-6 flex flex-col items-center text-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className="w-20 h-20 rounded-full border-2 border-zinc-700 bg-zinc-800 object-cover"
        />
        <div>
          <h1 className="text-xl font-black text-white">
            {profile.name || "Utilisateur"}
          </h1>
          {profile.username && (
            <p className="text-zinc-500 text-sm">{profile.username}</p>
          )}
          {profile.bio && (
            <p className="text-zinc-400 text-sm mt-1 max-w-xs">{profile.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-5 mt-1">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{posts.length}</p>
            <p className="text-zinc-500 text-xs">Notes</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{followerCount}</p>
            <p className="text-zinc-500 text-xs">Abonnés</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="text-center">
            <p className="text-2xl font-black text-white">{followingCount}</p>
            <p className="text-zinc-500 text-xs">Abonnements</p>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="text-center">
            <p
              className={`text-2xl font-black ${
                Number(avgScore) >= 8
                  ? "text-green-400"
                  : Number(avgScore) >= 5
                  ? "text-amber-400"
                  : avgScore === "—"
                  ? "text-zinc-500"
                  : "text-red-400"
              }`}
            >
              {avgScore}
            </p>
            <p className="text-zinc-500 text-xs">Moyenne</p>
          </div>
        </div>

        {/* Follow button */}
        {currentUser && currentUser.id !== id && (
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className="mt-2 px-8 py-2.5 rounded-full font-bold text-sm transition-all disabled:opacity-50"
            style={
              following
                ? { background: "rgb(39,39,42)", border: "1px solid rgb(63,63,70)", color: "rgb(161,161,170)" }
                : { background: "#4f46e5", color: "white" }
            }
          >
            {followLoading ? "…" : following ? "Se désabonner" : "S'abonner"}
          </button>
        )}
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="px-4 space-y-2.5">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Publications
          </h2>
          {posts.map((r) => {
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
                    r.score >= 8
                      ? "text-green-400"
                      : r.score >= 5
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {r.score}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-10 text-center">
          <p className="text-zinc-500 text-sm">Aucune publication pour l&apos;instant.</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
