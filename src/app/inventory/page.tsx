import type { Metadata } from "next";
import Link from "next/link";
import { MediaKit } from "@/components/media-kit";
import { PageHeader } from "@/components/page-header";
import { inventoryFill } from "@/packages/workspace/views";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  const fills = Object.fromEntries(inventoryFill().map((fill) => [fill.assetId, fill.fill]));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory">
        Every surface brands can buy, its price, weekly supply and how much is sold this week, plus
        what is never for sale. Supply is worked out from Apollo&apos;s published numbers (
        <Link href="/about/sources" className="text-accent underline underline-offset-2">
          sources
        </Link>
        ).
      </PageHeader>
      <MediaKit fills={fills} />
    </div>
  );
}
