"use client";

import { useState } from "react";
import { ChipGroup, toggleIn } from "@/components/fields";
import { STATUS_META, StatusTag } from "@/components/status-tag";
import { ASSETS } from "@/packages/catalog/assets";
import { CATEGORIES, CHANNELS } from "@/packages/catalog/taxonomy";
import type { AssetStatus, ChannelId, MediaAsset, Pricing } from "@/packages/catalog/types";
import { formatCount, formatINR } from "@/packages/format";

const STATUSES: readonly { id: AssetStatus; label: string }[] = (
  ["exists", "ready", "careful", "never"] as const
).map((id) => ({ id, label: STATUS_META[id].label }));

function rate(value: number): string {
  return value < 100 && !Number.isInteger(value) ? `₹${value.toFixed(2)}` : formatINR(value);
}

export function priceLabel(pricing: Pricing): string {
  switch (pricing.model) {
    case "cpm":
      return `${rate(pricing.rateINR)} per 1,000 views`;
    case "cpc":
      return `${rate(pricing.rateINR)} per click`;
    case "store_week":
      return `${rate(pricing.rateINR)} per store a week`;
    case "per_unit":
      return `${rate(pricing.rateINR)} per ${pricing.unit}`;
    case "flat_week":
      return `${rate(pricing.rateINR)} per slot a week`;
  }
}

function supplyLabel(asset: MediaAsset): string | null {
  if (asset.status === "never") return null;
  const { perWeek, unit } = asset.supply;
  switch (unit) {
    case "impressions":
      return `${formatCount(perWeek)} views a week`;
    case "stores":
      return `${formatCount(perWeek)} stores`;
    case "slots":
      return `${perWeek} ${perWeek === 1 ? "slot" : "slots"} a week`;
    case "units":
      return `${formatCount(perWeek)} ${asset.pricing.model === "per_unit" ? `${asset.pricing.unit}s` : "units"} a week`;
  }
}

const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export function MediaKit() {
  const [channels, setChannels] = useState<ChannelId[]>(CHANNELS.map((c) => c.id));
  const [statuses, setStatuses] = useState<AssetStatus[]>(["exists", "ready", "careful", "never"]);
  const visible = ASSETS.filter((a) => channels.includes(a.channel) && statuses.includes(a.status));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:gap-8">
        <ChipGroup
          legend="Channel"
          options={CHANNELS}
          selected={channels}
          onToggle={(id) => setChannels((list) => toggleIn(list, id))}
        />
        <ChipGroup
          legend="Status"
          options={STATUSES}
          selected={statuses}
          onToggle={(id) => setStatuses((list) => toggleIn(list, id))}
        />
      </div>

      <p className="text-sm text-muted" aria-live="polite">
        Showing {visible.length} of {ASSETS.length} surfaces.
      </p>

      {CHANNELS.filter((channel) => visible.some((a) => a.channel === channel.id)).map(
        (channel) => (
          <section key={channel.id} className="flex flex-col gap-3">
            <div className="flex flex-col">
              <h2 className="font-display text-xl font-bold tracking-tight">{channel.label}</h2>
              <p className="text-sm text-muted">{channel.description}</p>
            </div>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {visible
                .filter((asset) => asset.channel === channel.id)
                .map((asset) => {
                  const supply = supplyLabel(asset);
                  return (
                    <li
                      key={asset.id}
                      data-testid={`asset-${asset.id}`}
                      className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col">
                          <h3 className="font-semibold">{asset.name}</h3>
                          <p className="text-sm text-muted">{asset.format}</p>
                        </div>
                        <StatusTag status={asset.status} />
                      </div>
                      {asset.status !== "never" ? (
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex flex-col">
                            <dt className="eyebrow">Price</dt>
                            <dd className="num font-mono">{priceLabel(asset.pricing)}</dd>
                          </div>
                          <div className="flex flex-col">
                            <dt className="eyebrow">Supply</dt>
                            <dd className="num font-mono">{supply}</dd>
                          </div>
                        </dl>
                      ) : null}
                      {asset.rule ? (
                        <p
                          className={`rounded-md px-3 py-2 text-sm ${
                            asset.status === "never"
                              ? "bg-red-soft text-red"
                              : "bg-amber-soft text-amber"
                          }`}
                        >
                          {asset.rule}
                        </p>
                      ) : null}
                      <p className="text-sm">{asset.note}</p>
                      {asset.status !== "never" ? (
                        <div className="flex flex-col gap-1.5 border-t border-line pt-3">
                          <span className="text-xs text-muted">
                            Supply basis: {asset.supply.basis}
                          </span>
                          <span className="text-xs text-muted">
                            Sold to: {asset.buyers.map(categoryLabel).join(", ")}
                          </span>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
