import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 max-w-sm">
        <div className="text-7xl mb-2">⚡</div>
        <h1 className="text-5xl font-black text-white tracking-tighter">
          Fast<span className="text-indigo-400">.</span>
        </h1>
        <p className="text-zinc-400 text-lg leading-relaxed">
          Note absolument{" "}
          <span className="text-white font-semibold">tout</span>.
          Partage ta vision du monde, score par score.
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/feed"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-colors shadow-lg shadow-indigo-500/30"
          >
            Voir le Feed ▶
          </Link>
          <Link
            href="/create"
            className="w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-base transition-colors border border-zinc-700"
          >
            ✚ Créer une Note
          </Link>
          <Link
            href="/auth"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors py-1"
          >
            Connexion / Inscription
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-6">
          {[
            { label: "Notes", value: "2.4k" },
            { label: "Catégories", value: "8" },
            { label: "Villes", value: "42" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl py-3">
              <div className="text-xl font-black text-indigo-400">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
