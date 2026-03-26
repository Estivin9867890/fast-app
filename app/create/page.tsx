"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { THEMES, THEME_META, Theme } from "@/lib/mockData";
import { useApp } from "@/lib/AppContext";
import { uploadPostPhoto } from "@/lib/postService";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

export default function CreatePage() {
  const router = useRouter();
  const { addRating, currentUser } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    theme: "Restaurant" as Theme,
    score: 5,
    comment: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleGeolocate = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview || !photoFile || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const userId = currentUser?.id ?? "me";
      const photo_url = await uploadPostPhoto(photoFile, userId);

      await addRating({
        user_id:   userId,
        title:     form.title,
        theme:     form.theme,
        score:     form.score,
        comment:   form.comment,
        photo_url,
        lat:       location?.lat,
        lng:       location?.lng,
      });

      setSubmitted(true);
      router.push("/feed");
    } catch (err) {
      console.error("[create] handleSubmit error:", err);
      setIsSubmitting(false);
    }
  };

  const canSubmit = !!form.title && !!photoPreview && !isSubmitting;
  const meta = THEME_META[form.theme];

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl animate-bounce"
          style={{ background: `${meta.color}25` }}>
          ✅
        </div>
        <h2 className="text-2xl font-black text-white">Note publiée !</h2>
        <p className="text-zinc-500 text-sm">Visible dans le feed et sur la carte…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">

      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${meta.color}25` }}
        >
          {meta.emoji}
        </div>
        <div>
          <h1 className="text-xl font-black text-white leading-tight">Nouvelle Note</h1>
          <p className="text-zinc-500 text-xs">Photo · Thème · Score</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-5">

        {/* ── Photo (required) ── */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            Photo
            <span className="text-red-400 text-[10px] font-bold px-1.5 py-0.5 bg-red-400/10 rounded-full border border-red-400/20">
              Obligatoire
            </span>
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => { setPhotoPreview(null); setPhotoFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Changer
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-zinc-700 hover:border-indigo-500/60 bg-zinc-900/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-indigo-400"
            >
              <span className="text-4xl">📷</span>
              <span className="text-sm font-semibold">Ajouter une photo</span>
              <span className="text-xs opacity-60">Galerie ou appareil photo</span>
            </button>
          )}
        </div>

        {/* ── Title ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Qu&apos;est-ce que tu notes ?
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Mon ex, Glace pistache, Napoléon…"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-base"
          />
        </div>

        {/* ── Theme ── */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Thème</label>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((theme) => {
              const m = THEME_META[theme];
              const selected = form.theme === theme;
              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setForm({ ...form, theme })}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={{
                    background: selected ? `${m.color}15` : "rgb(24,24,27)",
                    borderColor: selected ? m.color : "rgb(63,63,70)",
                    color: selected ? "white" : "rgb(161,161,170)",
                  }}
                >
                  <span className="text-base">{m.emoji}</span>
                  <span className="truncate">{theme}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Score ── */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Note</label>
            <span
              className={`text-3xl font-black leading-none ${
                form.score >= 8 ? "text-green-400" : form.score >= 5 ? "text-amber-400" : "text-red-400"
              }`}
            >
              {form.score}
              <span className="text-base text-zinc-600 font-normal">/10</span>
            </span>
          </div>
          <input
            type="range" min={0} max={10}
            value={form.score}
            onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
            className="w-full h-2 cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>😤 Horrible</span>
            <span>🤩 Parfait</span>
          </div>
        </div>

        {/* ── Comment ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Commentaire <span className="text-zinc-600 normal-case">(optionnel)</span>
          </label>
          <textarea
            rows={3}
            placeholder="Dis-nous pourquoi…"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors text-sm resize-none"
          />
        </div>

        {/* ── Geolocation ── */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Localisation <span className="text-zinc-600 normal-case">(optionnel)</span>
          </label>

          {location && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-green-950/30 border border-green-500/30 text-green-400 text-sm font-semibold">
              <span>✅ {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
              <button
                type="button"
                onClick={() => setLocation(null)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGeolocate}
              disabled={locating}
              className="flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
              style={{ background: "rgb(24,24,27)", borderColor: "rgb(63,63,70)", color: "rgb(161,161,170)" }}
            >
              {locating ? <>📡 …</> : <>📍 GPS</>}
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex-1 py-2.5 rounded-xl border font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
              style={{ background: "rgb(24,24,27)", borderColor: "rgb(63,63,70)", color: "rgb(161,161,170)" }}
            >
              🗺️ Choisir sur carte
            </button>
          </div>
        </div>

        {showPicker && (
          <LocationPicker
            value={location}
            onChange={(loc) => setLocation(loc)}
            onClose={() => setShowPicker(false)}
          />
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-4 rounded-2xl font-black text-base transition-all disabled:opacity-35 disabled:cursor-not-allowed text-white"
          style={{
            background: canSubmit
              ? `linear-gradient(135deg, #4338ca, ${meta.color})`
              : "rgb(39,39,42)",
            boxShadow: canSubmit ? `0 8px 32px ${meta.color}35` : "none",
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
              </svg>
              Publication en cours…
            </span>
          ) : !photoPreview
            ? "📷 Ajoute d'abord une photo"
            : !form.title
            ? "✏️ Nomme ce que tu notes"
            : `Publier ⭐ ${form.score}/10`}
        </button>

      </form>

      <BottomNav />
    </div>
  );
}
