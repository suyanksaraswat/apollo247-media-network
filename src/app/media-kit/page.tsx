import type { Metadata } from "next";
import Link from "next/link";
import { MediaKit } from "@/components/media-kit";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Media kit" };

export default function MediaKitPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Identify valuable assets"
        title="Everything a brand can buy, and what it can't"
      >
        Sixteen surfaces across the app, the stores, the doorstep and data. Each shows its price,
        how much of it exists in a week and the rule it is sold under. Weekly supply is worked out
        from Apollo&apos;s published order and store numbers; see{" "}
        <Link href="/sources" className="text-accent underline underline-offset-2">
          Sources
        </Link>
        .
      </PageHeader>
      <MediaKit />
    </div>
  );
}
