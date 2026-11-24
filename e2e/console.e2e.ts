import { expect, test } from "@playwright/test";

test("the overview shows the business and what needs attention", async ({ page }) => {
  await page.goto("/");
  const kpis = page.getByTestId("kpis");
  await expect(kpis).toContainText("Booked");
  await expect(kpis).toContainText("Average sales lift");
  await page
    .getByTestId("attention")
    .getByRole("link", { name: /Soothera/ })
    .click();
  await expect(page).toHaveURL(/\/campaigns\/soothera-winter-throat$/);
  await expect(page.getByText("Changes needed")).toBeVisible();
});

test("campaigns filter by status", async ({ page }) => {
  await page.goto("/campaigns");
  await page.getByRole("tab", { name: /^Live/ }).click();
  const rows = page.getByTestId("campaigns").locator("tbody tr");
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText("Live");
});

test("a finished campaign shows lift against matched stores", async ({ page }) => {
  await page.goto("/campaigns/saltwell-summer-launch");
  await expect(
    page.getByRole("heading", { name: "Sales lift against matched stores" }),
  ).toBeVisible();
  await expect(page.getByText(/Before-and-after on campaign stores alone says/)).toBeVisible();
  await expect(
    page.getByRole("img", { name: /campaign stores against matched stores/ }),
  ).toBeVisible();
});

test("a prescription campaign is shown as rejected with no plan", async ({ page }) => {
  await page.goto("/campaigns/amoxiva-launch");
  await expect(page.getByTestId("plan-blocked")).toBeVisible();
  await expect(page.getByText("No consumer ad is possible for this product.")).toBeVisible();
});

test("approvals block copy with issues and approve clean copy", async ({ page }) => {
  await page.goto("/approvals");
  const flagged = page.getByTestId("approval-soothera-winter-throat");
  await expect(flagged.getByRole("button", { name: "Approve" })).toBeDisabled();
  const clean = page.getByTestId("approval-strideup-new-year");
  await clean.getByRole("button", { name: "Approve" }).click();
  await expect(clean.getByText("Approved. It will go live on its start date.")).toBeVisible();
});

test("inventory shows how much is sold this week", async ({ page }) => {
  await page.goto("/inventory");
  await expect(page.getByTestId("asset-store_screens")).toContainText("Sold this week");
});
