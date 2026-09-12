import { expect, test } from "@playwright/test";

test("protects the dashboard behind Clerk authentication", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/accounts\.dev\/sign-in/);
});

test("rejects an unauthenticated board route", async ({ page }) => {
  await page.goto("/board/smoke-test-board");
  await expect(page).toHaveURL(/accounts\.dev\/sign-in/);
});
