import type { Metadata } from "next";
import { KindTag, SourceLinks } from "@/components/evidence";
import { PageHeader, Section } from "@/components/page-header";
import { ASSUMPTIONS, FACTS, SOURCES } from "@/packages/catalog/evidence";

export const metadata: Metadata = { title: "Sources" };

function valueLabel(value: number, unit: string): string {
  if (unit.startsWith("share") || unit === "a year" || unit === "coefficient of variation") {
    return `${(value * 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
  }
  const number = value.toLocaleString("en-IN");
  return unit === "₹" ? `₹${number}` : `${number} ${unit}`;
}

export default function SourcesPage() {
  const assumptions = Object.values(ASSUMPTIONS);
  return (
    <div className="flex flex-col gap-12">
      <PageHeader eyebrow="Evidence" title="Where every number comes from">
        Public facts are linked to where they were published. Numbers worked out from them are
        marked derived. Anything Apollo would have to confirm is marked as a placeholder, so nobody
        mistakes a guess for a fact. All sources were read on 23 November 2026.
      </PageHeader>

      <Section title="Public facts">
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2 text-left">
              <tr>
                <th className="eyebrow px-4 py-2.5 font-medium">Fact</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Detail</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {FACTS.map((fact) => (
                <tr key={fact.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <div className="num font-mono font-medium">{fact.value}</div>
                    <div className="text-muted">{fact.label}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{fact.detail}</td>
                  <td className="px-4 py-3">
                    <SourceLinks ids={fact.sourceIds} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Model assumptions">
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-surface-2 text-left">
              <tr>
                <th className="eyebrow px-4 py-2.5 font-medium">Assumption</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Value</th>
                <th className="eyebrow px-4 py-2.5 font-medium">Status</th>
                <th className="eyebrow px-4 py-2.5 font-medium">How it was set</th>
              </tr>
            </thead>
            <tbody>
              {assumptions.map((item) => (
                <tr
                  key={item.id}
                  id={`a-${item.id}`}
                  className="scroll-mt-24 border-t border-line align-top target:bg-accent-soft"
                >
                  <td className="px-4 py-3 font-medium">{item.label}</td>
                  <td className="num px-4 py-3 font-mono whitespace-nowrap">
                    {valueLabel(item.value, item.unit)}
                  </td>
                  <td className="px-4 py-3">
                    <KindTag kind={item.kind} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <div>{item.note}</div>
                    <SourceLinks ids={item.sourceIds} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Sources">
        <ul className="flex flex-col gap-2 text-sm">
          {SOURCES.map((source) => (
            <li key={source.id} className="flex flex-col">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2"
              >
                {source.label}
              </a>
              <span className="text-muted">{source.publisher}</span>
            </li>
          ))}
        </ul>
        <p className="max-w-3xl text-sm text-muted">
          Rules referenced in the product: the Drugs and Magic Remedies (Objectionable
          Advertisements) Act, 1954 for cure claims; the Digital Personal Data Protection Act, 2023
          for consent and personal data; the Uniform Code for Pharmaceutical Marketing Practices,
          2024 for promotion to doctors, which this concept leaves out of scope.
        </p>
      </Section>
    </div>
  );
}
