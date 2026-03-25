"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Rating, THEME_META } from "@/lib/mockData";
import { useApp } from "@/lib/AppContext";
import { getLikeCount, getUserLike, toggleLike } from "@/lib/likeService";
import { getComments, addComment, Comment } from "@/lib/commentService";

interface FeedSlideProps {
  rating: Rating;
  onMapClick: (rating: Rating) => void;
}

function BigScore({ score }: { score: number }) {
  const color = score >= 8 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444";
  const glow  = score >= 8 ? "0 0 40px #22c55e66" : score >= 5 ? "0 0 40px #f59e0b66" : "0 0 40px #ef444466";
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex flex-col items-center px-5 py-3 rounded-3xl"
        style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(10px)" }}
      >
        <span
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: "88px",
            color,
            lineHeight: 1,
            textShadow: `${glow}, 0 4px 24px rgba(0,0,0,0.9)`,
            WebkitTextStroke: "1.5px rgba(0,0,0,0.55)",
          }}
        >
          {score}
        </span>
        <span className="text-sm font-black tracking-widest" style={{ color: `${color}bb` }}>
          / 10
        </span>
      </div>
    </div>
  );
}

function SideAction({
  icon, label, onClick, active, activeClass,
}: {
  icon: string; label: string;
  onClick?: () => void; active?: boolean; activeClass?: string;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div
        className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all text-xl ${
          active ? activeClass ?? "bg-white/20 scale-110" : "bg-black/45 hover:bg-white/10"
        }`}
      >
        {icon}
      </div>
      <span className="text-white/55 text-[10px] font-semibold leading-none">{label}</span>
    </button>
  );
}

export default function FeedSlide({ rating, onMapClick }: FeedSlideProps) {
  const { currentUser } = useApp();
  const [liked, setLiked]               = useState(false);
  const [likeCount, setLikeCount]       = useState(0);
  const [imgError, setImgError]         = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [commentText, setCommentText]   = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  const meta = THEME_META[rating.theme];

  // Load like count + comment count + user's like state on mount
  useEffect(() => {
    getLikeCount(rating.id).then(setLikeCount);
    getComments(rating.id).then((data) => setCommentCount(data.length));
    if (currentUser?.id) {
      getUserLike(rating.id, currentUser.id).then(setLiked);
    }
  }, [rating.id, currentUser?.id]);

  const handleLike = async () => {
    // Optimistic update
    setLiked((prev) => !prev);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    // Persist (no-op if unconfigured or not logged in)
    if (currentUser?.id) {
      await toggleLike(rating.id, currentUser.id, liked);
    }
  };

  const handleToggleComments = async () => {
    const opening = !showComments;
    setShowComments(opening);
    if (opening) {
      setLoadingComments(true);
      const data = await getComments(rating.id);
      setComments(data);
      setCommentCount(data.length);
      setLoadingComments(false);
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser?.id || submitting) return;
    setSubmitting(true);
    const local: Comment = {
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      post_id: rating.id,
      user_id: currentUser.id,
      content: commentText.trim(),
      author: "Moi",
      avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${currentUser.id}`,
    };
    setComments((prev) => [...prev, local]);
    setCommentText("");
    const saved = await addComment(rating.id, currentUser.id, local.content);
    if (saved) {
      setComments((prev) => prev.map((c) => (c.id === local.id ? saved : c)));
    }
    setCommentCount((n) => n + 1);
    setSubmitting(false);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/feed`;
    const text = `${rating.title} — ${rating.score}/10`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Fast.", text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  const timeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3_600_000);
    return h < 1 ? "maintenant" : h < 24 ? `${h}h` : `${Math.floor(h / 24)}j`;
  };

  return (
    <div className="relative h-screen w-full snap-start snap-always overflow-hidden bg-zinc-950">

      {/* ── Hero photo ── */}
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={rating.photo_url}
          alt={rating.title}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `${meta.color}15` }}
        >
          <span className="text-[160px] opacity-10">{meta.emoji}</span>
        </div>
      )}

      {/* ── Gradients ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

      {/* ══ TOP BAR ══ */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-12 pb-3">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border"
          style={{
            background:  `${meta.color}28`,
            borderColor: `${meta.color}55`,
            color: "white",
          }}
        >
          {meta.emoji} {rating.theme}
        </span>
        <span className="text-[11px] text-white/35 font-medium tabular-nums">
          {timeAgo(rating.created_at)}
        </span>
      </div>

      {/* ══ CENTRE: BIG SCORE ══ */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center pt-28 pointer-events-none">
        <BigScore score={rating.score} />
      </div>

      {/* ══ RIGHT SIDEBAR ══ */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-5">
        <SideAction
          icon={liked ? "❤️" : "🤍"}
          label={String(likeCount)}
          onClick={handleLike}
          active={liked}
          activeClass="bg-red-500/30 scale-110"
        />
        <SideAction
          icon="💬"
          label="Comms."
          onClick={handleToggleComments}
          active={showComments}
          activeClass="bg-indigo-500/30 scale-110"
        />
        <SideAction
          icon="📍"
          label="Carte"
          onClick={() => onMapClick(rating)}
        />
        <SideAction
          icon="↗️"
          label="Partager"
          onClick={handleShare}
        />
      </div>

      {/* ══ BOTTOM INFO ══ */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-20 px-4 pr-14 space-y-2">
        <Link
          href={`/profile/${rating.user_id}`}
          className="flex items-center gap-2 w-fit"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={rating.avatar}
            alt={rating.author}
            className="w-7 h-7 rounded-full border-2 border-white/20 bg-zinc-800 shrink-0"
          />
          <span className="text-sm font-semibold text-white/90 drop-shadow truncate">
            {rating.author}
          </span>
        </Link>
        <h2 className="text-[22px] font-black text-white leading-tight drop-shadow-lg line-clamp-2">
          {rating.title}
        </h2>
        {rating.comment && (
          <p className="text-white/70 text-sm leading-relaxed line-clamp-2 drop-shadow">
            &ldquo;{rating.comment}&rdquo;
          </p>
        )}
        <div className="pt-0.5 flex items-center gap-2">
          <button
            onClick={handleToggleComments}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            💬 {commentCount > 0 ? `${commentCount} commentaire${commentCount > 1 ? "s" : ""}` : "Commenter"}
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/65 text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            ↗ Partager
          </button>
        </div>
      </div>

      {/* ══ COMMENTS DRAWER (slides up from bottom within slide) ══ */}
      {showComments && (
        <div
          className="absolute inset-x-0 bottom-0 z-30 flex flex-col"
          style={{
            height: "70%",
            background: "rgba(9,9,11,0.96)",
            backdropFilter: "blur(20px)",
            borderRadius: "22px 22px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Handle + header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 rounded-full bg-zinc-600" />
              <span className="font-bold text-white text-sm ml-2">
                Commentaires
                {comments.length > 0 && (
                  <span className="ml-1.5 text-zinc-500 font-normal text-xs">({comments.length})</span>
                )}
              </span>
            </div>
            <button
              onClick={() => setShowComments(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4" style={{ scrollbarWidth: "none" }}>
            {loadingComments ? (
              <p className="text-zinc-500 text-sm text-center py-6 animate-pulse">Chargement…</p>
            ) : comments.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-6">
                Sois le premier à commenter ✍️
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar}
                    alt={c.author}
                    className="w-7 h-7 rounded-full shrink-0 bg-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white/80">{c.author} </span>
                    <span className="text-xs text-white/60 leading-relaxed">{c.content}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input — pb-20 pour ne pas être caché par la BottomNav */}
          <div className="px-4 pt-3 pb-20 border-t border-white/[0.07]">
            {currentUser ? (
              <div className="flex gap-2 items-center">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Ajouter un commentaire…"
                  className="flex-1 bg-zinc-800/80 rounded-full px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none border border-zinc-700 focus:border-indigo-500 transition-colors"
                />
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !commentText.trim()}
                  className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 text-center pb-1">
                <a href="/auth" className="text-indigo-400 font-semibold hover:text-indigo-300">
                  Connectez-vous
                </a>{" "}
                pour commenter
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
