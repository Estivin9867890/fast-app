"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
        strokeLinejoin="round"
      />
      <path
        d="M9 21V12h6v9"
        stroke={active ? "white" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3" y="3" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
      />
      <rect
        x="14" y="3" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
      />
      <rect
        x="3" y="14" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
      />
      <rect
        x="14" y="14" width="7" height="7" rx="1.5"
        stroke="currentColor" strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

function IconMap({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 20l-6-3V4l6 3m0 13l6-3m-6 3V7m6 10l6 3V7l-6-3m0 13V4"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function IconUser({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12" cy="8" r="4"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.2 : 0}
      />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  { href: "/feed",    label: "Feed",   Icon: IconHome },
  { href: "/themes",  label: "Thèmes", Icon: IconGrid },
  { href: "/map",     label: "Carte",  Icon: IconMap  },
  { href: "/profile", label: "Profil", Icon: IconUser },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="flex items-center h-16 px-1">
        {/* Left two items */}
        {navItems.slice(0, 2).map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                active ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}

        {/* Center create button */}
        <div className="flex-1 flex justify-center items-center">
          <Link
            href="/create"
            className={`relative -top-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
              pathname.startsWith("/create")
                ? "bg-indigo-500 shadow-indigo-500/50 scale-105"
                : "bg-indigo-600 shadow-indigo-500/30 hover:bg-indigo-500 hover:scale-105"
            }`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        {/* Right two items */}
        {navItems.slice(2).map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors ${
                active ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
