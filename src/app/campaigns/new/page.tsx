import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Planner } from "@/components/planner";

export const metadata: Metadata = { title: "New campaign" };

export default function NewCampaignPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link href="/campaigns" className="text-sm text-muted hover:text-ink">
          ← Campaigns
        </Link>
        <PageHeader title="New campaign">
          Paste the brand&apos;s brief and Gemini fills in the fields. The plan is worked out from
          the inventory, and the rules refuse what the law and patients&apos; trust rule out.
        </PageHeader>
      </div>
      <Planner />
    </div>
  );
}
