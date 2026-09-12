import { test, expect } from '@playwright/test'

test.describe('Authenticated editor interactions', () => {
  test.beforeEach(() => {
    test.skip(
      !process.env.E2E_CLERK_USER_EMAIL || !process.env.E2E_CLERK_USER_PASSWORD,
      'Missing Clerk test credentials'
    )
  })

  test('opens the authenticated workspace and creates a board', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/accounts\.dev\/sign-in/)

    const newBoard = page.getByRole('button', { name: /new board/i }).first()
    await expect(newBoard).toBeVisible({ timeout: 15_000 })
    await newBoard.click()

    const canvas = page.locator('svg[data-board-canvas="true"]')
    await expect(canvas).toBeVisible({ timeout: 25_000 })

    // Wait for Liveblocks room storage to be ready before performing mutations
    await page.getByText(/saved/i).waitFor({ state: 'visible', timeout: 20_000 })

    await page.getByRole('button', { name: /rectangle/i }).click()
    await canvas.click({ position: { x: 300, y: 200 } })

    await expect(canvas.locator('rect.drop-shadow-md')).toHaveCount(1)

    await page.keyboard.press('Delete')
    await expect(canvas.locator('rect.drop-shadow-md')).toHaveCount(0)

    await page.reload()
    await expect(page.locator('svg[data-board-canvas="true"]')).toBeVisible({ timeout: 25_000 })
  })
})