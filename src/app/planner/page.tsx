import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Planner } from "@/components/planner";

export const metadata: Metadata = { title: "Campaign planner" };

export default function PlannerPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Build commercial propositions" title="From a brand's brief to a plan">
        Gemini reads the brief into fields it can only fill from fixed lists. The plan itself is
        worked out in code from the media kit, so the same brief always gets the same plan, and the
        rules refuse what the law and patients&apos; trust rule out.
      </PageHeader>
      <Planner />
    </div>
  );
}
