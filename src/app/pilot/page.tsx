import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PilotLab } from "@/components/pilot-lab";

export const metadata: Metadata = { title: "Store pilot" };

export default function PilotPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Prove it before scaling it" title="A store pilot a brand can trust">
        Brands renew when they can see what their money did. Each campaign store gets a matched
        store that doesn&apos;t run the campaign, and the pilot is sized so that a real lift shows
        up above the normal week-to-week swing.
      </PageHeader>
      <PilotLab />
    </div>
  );
}
