import { expect, test } from "@playwright/test";

test("the pilot shows matched pairs, the lift it can detect and a readout", async ({ page }) => {
  await page.goto("/pilots");
  const design = page.getByTestId("design");
  await expect(design).toContainText("Matched pairs");
  const before = await design.textContent();
  await page.getByRole("spinbutton", { name: "Campaign stores" }).fill("150");
  await expect(design).not.toHaveText(before ?? "");
  await expect(page.getByTestId("readout")).toContainText("Measured lift");
  await expect(
    page.getByRole("img", { name: /campaign stores against matched stores/ }),
  ).toBeVisible();
});

test("the revenue model changes with the scenario and with an input", async ({ page }) => {
  await page.goto("/forecast");
  const total = page.getByTestId("year-three-total");
  const base = await total.textContent();
  await page.getByRole("button", { name: "Ambitious" }).click();
  await expect(total).not.toHaveText(base ?? "");
  const ambitious = await total.textContent();
  await page.getByRole("spinbutton", { name: "Online GMV, FY26 (₹ crore)" }).fill("5000");
  await expect(total).not.toHaveText(ambitious ?? "");
  await expect(page.getByRole("img", { name: /Media revenue by year/ })).toBeVisible();
});

test("the media kit filters to what is never sold", async ({ page }) => {
  await page.goto("/inventory");
  const status = page.getByRole("group", { name: "Status" });
  await status.getByRole("button", { name: "Exists" }).click();
  await status.getByRole("button", { name: "Ready" }).click();
  await status.getByRole("button", { name: "Careful" }).click();
  await expect(page.getByText("Showing 3 of 16 surfaces.")).toBeVisible();
  await expect(page.getByTestId("asset-lab_reports")).toContainText(
    "No ads beside a patient's test results.",
  );
});

test("every assumption tag links to its row on the Sources page", async ({ page }) => {
  await page.goto("/forecast");
  await page.getByRole("link", { name: "Sourced" }).first().click();
  await expect(page).toHaveURL(/\/about\/sources#a-/);
  const id = new URL(page.url()).hash;
  await expect(page.locator(id)).toBeVisible();
});

test("external sources open in a new tab", async ({ page }) => {
  await page.goto("/about/sources");
  const links = await page.locator('a[href^="https://"]').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      target: anchor.getAttribute("target"),
      rel: anchor.getAttribute("rel") ?? "",
    })),
  );
  expect(links.length).toBeGreaterThan(5);
  expect(links.every((link) => link.target === "_blank" && link.rel.includes("noopener"))).toBe(
    true,
  );
});
