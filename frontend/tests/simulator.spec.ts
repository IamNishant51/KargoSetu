import { test, expect } from "@playwright/test";

test("simulator page loads and runs simulation", async ({ page }) => {
  await page.goto("/simulator");
  await expect(page.locator("h1")).toHaveText("What-If Simulator");

  await page.route("**/api/v1/simulator", async (route) => {
    const json = { delta: 42, base: 100, scenario: 142 };
    await route.fulfill({ json });
  });

  await page.click('button:has-text("Run Simulation")');
  await expect(page.locator("h2")).toHaveText("Result");
  await expect(page.locator("pre")).toContainText("delta");
});
