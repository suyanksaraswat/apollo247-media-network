"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ICONS } from "@/components/icons";

type NavItem = { href: string; label: string; icon: ReactNode; badge?: number };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/campaigns")
    return pathname === "/campaigns" || /^\/campaigns\/(?!new$)/.test(pathname);
  if (href === "/about") return pathname === "/about";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Home">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-ink">
        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
          <rect x="3" y="8.5" width="2.2" height="4.5" rx="0.6" />
          <rect x="6.9" y="5.5" width="2.2" height="7.5" rx="0.6" />
          <rect x="10.8" y="3" width="2.2" height="10" rx="0.6" />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-[13.5px] font-bold tracking-tight whitespace-nowrap">
          Apollo 24|7 Media Network
        </span>
        <span className="font-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-muted uppercase">
          Unofficial concept
        </span>
      </span>
    </Link>
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: readonly NavItem[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-accent-soft font-semibold text-accent"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="num rounded-full bg-amber-soft px-1.5 font-mono text-[11px] text-amber">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Sidebar({
  pathname,
  approvals,
  onNavigate,
}: {
  pathname: string;
  approvals: number;
  onNavigate: () => void;
}) {
  const workspace: NavItem[] = [
    { href: "/", label: "Overview", icon: ICONS.overview },
    { href: "/campaigns", label: "Campaigns", icon: ICONS.campaigns },
    { href: "/approvals", label: "Approvals", icon: ICONS.approvals, badge: approvals },
    { href: "/inventory", label: "Inventory", icon: ICONS.inventory },
    { href: "/pilots", label: "Store pilots", icon: ICONS.pilots },
    { href: "/forecast", label: "Forecast", icon: ICONS.forecast },
  ];
  const about: NavItem[] = [
    { href: "/about", label: "Why this network", icon: ICONS.about },
    { href: "/about/plan", label: "90-day plan", icon: ICONS.plan },
    { href: "/about/sources", label: "Sources", icon: ICONS.sources },
  ];
  return (
    <div className="flex h-full flex-col gap-6 px-3 py-4">
      <div className="hidden px-1 lg:block">
        <Brand />
      </div>
      <Link
        href="/campaigns/new"
        onClick={onNavigate}
        className="flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-ink hover:opacity-90"
      >
        {ICONS.plus}
        New campaign
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-6">
        <NavList items={workspace} pathname={pathname} onNavigate={onNavigate} />
        <div className="flex flex-col gap-1.5">
          <p className="eyebrow px-2.5">About this concept</p>
          <NavList items={about} pathname={pathname} onNavigate={onNavigate} />
        </div>
      </nav>
      <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-line p-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 font-mono text-xs font-medium">
          AS
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-sm font-medium">Ad sales team</span>
          <span className="text-xs text-muted">Demo workspace</span>
        </span>
      </div>
    </div>
  );
}

export function AppShell({ approvals, children }: { approvals: number; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh overflow-y-auto border-r border-line bg-surface lg:block">
        <Sidebar pathname={pathname} approvals={approvals} onNavigate={close} />
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-2.5 lg:hidden">
          <Brand />
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="rounded-md border border-line p-2 text-ink"
          >
            {ICONS.menu}
          </button>
        </header>

        {open ? (
          <dialog
            open
            aria-label="Menu"
            className="fixed inset-0 z-40 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 lg:hidden"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="absolute inset-0 bg-black/40"
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto border-r border-line bg-surface">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="font-display text-sm font-bold">Menu</span>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="rounded-md p-2"
                >
                  {ICONS.close}
                </button>
              </div>
              <Sidebar pathname={pathname} approvals={approvals} onNavigate={close} />
            </div>
          </dialog>
        ) : null}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="border-t border-line px-4 py-4 text-xs text-muted sm:px-6 lg:px-8">
          A concept by Suyank Saraswat for the Apollo 24|7 DGM Monetization role, built on public
          information. Not affiliated with or endorsed by Apollo. Brands, stores and campaign data
          are fictional; public figures link to their{" "}
          <Link href="/about/sources" className="underline underline-offset-2">
            sources
          </Link>
          .
        </footer>
      </div>
    </div>
  );
}
