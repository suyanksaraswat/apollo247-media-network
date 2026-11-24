import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/campaigns/new");
});

test("the first sample brief gets a plan across stores and doorstep", async ({ page }) => {
  const plan = page.getByTestId("plan");
  await expect(plan).toBeVisible();
  await expect(plan.getByTestId("line-store_screens")).toBeVisible();
  await expect(plan.getByTestId("line-delivery_sampling")).toBeVisible();
  await expect(page.getByTestId("review")).toContainText("Needs changes");
});

test("a prescription medicine gets no consumer plan", async ({ page }) => {
  await page.getByRole("button", { name: "Prescription antibiotic" }).click();
  await expect(page.getByTestId("plan-blocked")).toContainText("not advertised to the public");
});

test("a request to target people by condition is refused", async ({ page }) => {
  await page.getByRole("button", { name: "Glucometer, three metros" }).click();
  await expect(page.getByText("Audience request refused.")).toBeVisible();
  await expect(page.getByTestId("plan")).toBeVisible();
});

test("changing the product type to prescription blocks the plan", async ({ page }) => {
  await page.getByRole("combobox", { name: "What is advertised" }).selectOption("rx");
  await expect(page.getByTestId("plan-blocked")).toBeVisible();
});

test("an insurer's plan leaves out the shelf and says why", async ({ page }) => {
  await page.getByRole("button", { name: "Health insurer, monsoon" }).click();
  await expect(page.getByTestId("line-sponsored_products")).toHaveCount(0);
  await page.getByText(/Left out and why/).click();
  await expect(page.getByText("Not sold to Insurance and finance brands.").first()).toBeVisible();
});

test("a new brief explains that AI reading is off without a key", async ({ page }) => {
  await page
    .getByRole("textbox", { name: "Brief", exact: true })
    .fill("A protein bar wants trial in Pune for five weeks, ₹12 lakh.");
  await page.getByRole("button", { name: "Read brief with AI" }).click();
  await expect(page.getByText("AI reading is switched off on this deployment.")).toBeVisible();
});

test("the sample copy review offers a compliant rewrite", async ({ page }) => {
  await page.getByRole("button", { name: "Check copy" }).click();
  await expect(page.getByTestId("review")).toContainText("Helps you rehydrate on hot days.");
});
