import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RevenueModel } from "@/components/revenue-model";

export const metadata: Metadata = { title: "Revenue model" };

export default function RevenuePage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader eyebrow="Sustainable revenue" title="Three years of media revenue">
        Four lines: ads in the app, media in stores, sampling at the doorstep and insights for
        brands. The online base is Apollo&apos;s reported FY26 GMV; the rest are assumptions you can
        change, each tagged with where it comes from.
      </PageHeader>
      <RevenueModel />
    </div>
  );
}
