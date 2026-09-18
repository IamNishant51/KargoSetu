import { test, expect } from "@playwright/test";

test("Idle scenario page loads and shows components", async ({ page }) => {
  page.on("console", (msg) => console.log("BROWSER CONSOLE:", msg.text()));
  // We mock the API call
  await page.route("**/api/v1/idle-scenarios/estimate", (route) => {
    if (route.request().method() === "OPTIONS") {
      route.fulfill({
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
      return;
    }
    route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({
        estimated_idle_days_min: 5,
        estimated_idle_days_max: 10,
        idle_risk: "HIGH",
        contributing_factors: [
          { factor: "Gap before next cargo window", impact: "High" },
        ],
        alternate_employment_suggestions: [
          {
            destination: "Singapore",
            estimated_distance_nm: 1200,
            expected_demand: "High",
          },
        ],
        estimated_economic_impact: 150000,
        model_output: false,
        heuristic: true,
        unknown_data: [],
      }),
    });
  });

  await page
    .context()
    .addCookies([
      {
        name: "auth_token",
        value: "test-token",
        domain: "localhost",
        path: "/",
      },
    ]);
  await page.goto("/dashboard/idle-scenario");

  await expect(
    page.locator("text=What happens after this vessel arrives?"),
  ).toBeVisible({ timeout: 15000 });

  // Fill in required form fields
  await page.fill('input[type="date"]', "2026-10-01");

  await page.click('button:has-text("Estimate Idle Risk")');

  await expect(page.locator("text=HIGH").first()).toBeVisible({
    timeout: 15000,
  });
  await expect(page.locator("text=5 - 10 days")).toBeVisible();
  await expect(page.locator("text=Gap before next cargo window")).toBeVisible();
  await expect(page.locator("text=Singapore")).toBeVisible();
});
