import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-[max(1rem,env(safe-area-inset-left))] py-6 text-sm text-muted">
        <p>
          A concept by Suyank Saraswat for the Apollo 24|7 DGM Monetization role, built on public
          information. Not affiliated with or endorsed by Apollo.
        </p>
        <p>
          Store, shopper and sales data are synthetic. Every other number shows where it came from
          on the{" "}
          <Link href="/sources" className="text-accent underline underline-offset-2">
            Sources
          </Link>{" "}
          page.
        </p>
      </div>
    </footer>
  );
}
