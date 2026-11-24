import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RevenueModel } from "@/components/revenue-model";

export const metadata: Metadata = { title: "Forecast" };

export default function ForecastPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Forecast">
        Three years of media revenue across the app, stores, doorstep and insights. The online base
        is Apollo&apos;s reported FY26 GMV; every other input is tagged with where it comes from.
      </PageHeader>
      <RevenueModel />
    </div>
  );
}
