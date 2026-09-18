import { test, expect } from "@playwright/test";

test.describe("Procurement Decision Brief", () => {
  test.beforeEach(async ({ page }) => {
    // Add auth cookie to bypass login
    await page.context().addCookies([
      {
        name: "auth_token",
        value: "test-token",
        domain: "localhost",
        path: "/",
      },
    ]);
    // Navigate to the decision brief page
    await page.goto("/dashboard/brief");
  });

  test("should render all 5 required sections of the brief", async ({
    page,
  }) => {
    await expect(
      page.locator('h2:has-text("1. Executive Recommendation")'),
    ).toBeVisible();
    await expect(
      page.locator(
        'h2:has-text("2. Scenario Comparison Table (Base vs Selected Scenario)")',
      ),
    ).toBeVisible();
    await expect(
      page.locator('h2:has-text("3. Feasibility Matrix")'),
    ).toBeVisible();
    await expect(page.locator('h2:has-text("4. Risk Profile")')).toBeVisible();
    await expect(
      page.locator('h2:has-text("5. AI Justification")'),
    ).toBeVisible();
  });

  test("should include explicit sign-off blocks", async ({ page }) => {
    await expect(page.getByText("Prepared By (Analyst)")).toBeVisible();
    await expect(page.getByText("Reviewed By (Procurement Mgr)")).toBeVisible();
    await expect(page.getByText("Approved By (Director)")).toBeVisible();
  });

  test("should have a print and export button that are hidden in print media", async ({
    page,
  }) => {
    const printButton = page.locator('button:has-text("Print / PDF")');
    const exportButton = page.locator('button:has-text("Export JSON")');

    await expect(printButton).toBeVisible();
    await expect(exportButton).toBeVisible();

    // Emulate print media type
    await page.emulateMedia({ media: "print" });

    // In print mode, these buttons should be hidden by the `print:hidden` class
    await expect(printButton).toBeHidden();
    await expect(exportButton).toBeHidden();
  });
});
