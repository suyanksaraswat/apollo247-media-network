import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", heading: /^Overview$/ },
  { path: "/campaigns", heading: /^Campaigns$/ },
  { path: "/campaigns/saltwell-summer-launch", heading: /^Summer launch$/ },
  { path: "/campaigns/new", heading: /^New campaign$/ },
  { path: "/approvals", heading: /^Approvals$/ },
  { path: "/inventory", heading: /^Inventory$/ },
  { path: "/pilots", heading: /^Store pilots$/ },
  { path: "/forecast", heading: /^Forecast$/ },
  { path: "/about", heading: /Why this network/ },
  { path: "/about/plan", heading: /Audit, sell a measured pilot/ },
  { path: "/about/sources", heading: /Where every number comes from/ },
];

for (const { path, heading } of PAGES) {
  test(`${path} loads, fits the screen and says it is a concept`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.getByText("Not affiliated with or endorsed by Apollo.")).toBeVisible();
    await expect(
      page.getByText("Unofficial concept", { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("the sidebar reaches every section", async ({ page }, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Store pilots" }).click();
  await expect(page).toHaveURL(/\/pilots$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Store pilots");
});

test("old addresses redirect to the console", async ({ page }) => {
  await page.goto("/planner");
  await expect(page).toHaveURL(/\/campaigns\/new$/);
  await page.goto("/media-kit");
  await expect(page).toHaveURL(/\/inventory$/);
});
