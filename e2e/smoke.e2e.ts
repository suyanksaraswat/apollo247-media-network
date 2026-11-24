import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", heading: /One media network/ },
  { path: "/plan", heading: /Audit, sell a measured pilot/ },
  { path: "/media-kit", heading: /Everything a brand can buy/ },
  { path: "/planner", heading: /From a brand's brief to a plan/ },
  { path: "/pilot", heading: /A store pilot a brand can trust/ },
  { path: "/revenue", heading: /Three years of media revenue/ },
  { path: "/sources", heading: /Where every number comes from/ },
];

for (const { path, heading } of PAGES) {
  test(`${path} loads, fits the screen and says it is a concept`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.getByText("Not affiliated with or endorsed by Apollo.")).toBeVisible();
    await expect(page.getByText("Unofficial concept", { exact: true })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("the main navigation reaches every page", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Store pilot" }).click();
  await expect(page).toHaveURL(/\/pilot$/);
  await expect(nav.getByRole("link", { name: "Store pilot" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
