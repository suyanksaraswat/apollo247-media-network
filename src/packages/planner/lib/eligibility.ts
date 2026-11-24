import { CATEGORIES, OBJECTIVES, PRODUCT_CLASSES } from "@/packages/catalog/taxonomy";
import type { CategoryId, MediaAsset, ObjectiveId, ProductClassId } from "@/packages/catalog/types";
import type { Eligibility } from "../types";

function labelOf(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function classBlock(productClass: ProductClassId): string | null {
  const found = PRODUCT_CLASSES.find((c) => c.id === productClass);
  if (!found || found.consumerAds) return null;
  return found.reason ?? `${found.label} can't be advertised to consumers.`;
}

export function eligibility(
  asset: MediaAsset,
  category: CategoryId,
  productClass: ProductClassId,
  objective: ObjectiveId,
): Eligibility {
  const blocked = classBlock(productClass);
  if (blocked) return { eligible: false, reason: blocked };
  if (asset.status === "never") return { eligible: false, reason: asset.rule };
  if (!asset.buyers.includes(category)) {
    return { eligible: false, reason: `Not sold to ${labelOf(CATEGORIES, category)} brands.` };
  }
  if (asset.allowedClasses && !asset.allowedClasses.includes(productClass)) {
    return {
      eligible: false,
      reason: asset.rule ?? `Not open to ${labelOf(PRODUCT_CLASSES, productClass)}.`,
    };
  }
  if (asset.objectiveFit[objective] === 0) {
    return {
      eligible: false,
      reason: `Doesn't serve ${labelOf(OBJECTIVES, objective).toLowerCase()}.`,
    };
  }
  return { eligible: true };
}
