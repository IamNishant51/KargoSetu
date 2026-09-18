import { test, expect } from "@playwright/test";

test.describe("Copilot Widget", () => {
  // Set longer timeout for initial Next.js compilation
  test.setTimeout(120000);

  test("should load the copilot widget and handle hallucination-prone questions", async ({
    page,
  }) => {
    // Mock API responses for DashboardClient to load fast
    await page.route("**/api/v1/ports", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{ name: "Haldia", subtext: "India" }]),
      });
    });
    await page.route("**/api/v1/commodities", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify(["Iron Ore"]) });
    });
    await page.route("**/api/v1/requisitions/evaluate", (route) => {
      route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    await page.route("**/api/v1/copilot/ask", (route) => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          answer: "Insufficient verified data for this conclusion.",
          provenance: { source: "none", is_synthetic: true },
          uncertainty: "high",
          tools_used: [],
        }),
      });
    });

    await page.context().addCookies([
      {
        name: "auth_token",
        value: "test-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    // Go to the dashboard
    await page.goto("/dashboard");

    // Check if Copilot Widget is visible
    const copilotHeading = page
      .locator("h3", { hasText: "KargoSetu Decision Copilot" })
      .or(page.locator("text=KargoSetu Decision Copilot"));
    await expect(copilotHeading.first()).toBeVisible({ timeout: 60000 });

    // Type a hallucination-prone question
    const input = page.getByPlaceholder(
      "Ask about forecast, vessel feasibility, or risks...",
    );
    await input.fill("invent a live price for Panamax in Haldia");

    // Click Ask button
    const askButton = page.locator("button", { hasText: "Ask" });
    await askButton.click();

    const responseText = page.locator(
      "text=Insufficient verified data for this conclusion.",
    );
    await expect(responseText).toBeVisible({ timeout: 15000 });
  });
});
