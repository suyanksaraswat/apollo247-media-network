import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PilotLab } from "@/components/pilot-lab";

export const metadata: Metadata = { title: "Store pilots" };

export default function PilotsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Store pilots">
        Design a pilot before selling it: matched control stores, the smallest lift it can detect,
        and what the brand&apos;s report would show.
      </PageHeader>
      <PilotLab />
    </div>
  );
}
