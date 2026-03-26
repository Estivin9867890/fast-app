"use client";

export type FeedTab = "amis" | "pour-toi";

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 flex justify-center pt-12 pointer-events-none">
      <div
        className="pointer-events-auto flex gap-1 p-1 rounded-full"
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {(["amis", "pour-toi"] as FeedTab[]).map((tab) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className="px-4 py-1.5 rounded-full text-sm font-bold transition-all"
              style={
                isActive
                  ? { background: "white", color: "black" }
                  : { color: "rgba(255,255,255,0.55)" }
              }
            >
              {tab === "amis" ? "Amis" : "Pour toi"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
