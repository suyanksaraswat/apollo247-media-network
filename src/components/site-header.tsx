"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/plan", label: "90-day plan" },
  { href: "/media-kit", label: "Media kit" },
  { href: "/planner", label: "Planner" },
  { href: "/pilot", label: "Store pilot" },
  { href: "/revenue", label: "Revenue" },
  { href: "/sources", label: "Sources" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-[max(1rem,env(safe-area-inset-left))] py-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Home">
          <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap">
            Apollo 24|7 Media Network
          </span>
          <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
            Unofficial concept
          </span>
        </Link>
        <nav
          aria-label="Main"
          className="-mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto sm:justify-end"
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  active
                    ? "bg-accent-soft font-semibold text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
