import { test, expect } from "@playwright/test";

test("risk engine page loads and has required fields", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "auth_token",
      value: "test-token",
      domain: "localhost",
      path: "/",
    },
  ]);
  await page.goto("/dashboard/risk");
  await expect(
    page.locator("h1", { hasText: "Explainable Risk Engine" }),
  ).toBeVisible();
  await expect(
    page.locator("button", { hasText: "Evaluate Risk" }),
  ).toBeVisible();
});
