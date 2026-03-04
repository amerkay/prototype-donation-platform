import { test } from '@playwright/test'

const BASE = 'http://localhost:3000'
const CAMPAIGN_URL = `${BASE}/admin/campaigns/adopt-orangutan/`
const FORM_URL = `${BASE}/admin/campaigns/adopt-orangutan/forms/form-orangutan-full/edit`

test.describe('Form Search UX', () => {
  test('Campaign: search filters, highlights, no-results', async ({ page }) => {
    await page.goto(CAMPAIGN_URL)
    await page.waitForSelector('input[placeholder="Search fields..."]', { timeout: 15000 })
    await page.waitForTimeout(500)

    const searchInput = page.locator('input[placeholder="Search fields..."]')

    // Pre-search: screenshot + counts
    await page.screenshot({ path: 'test-results/01-campaign-before.png', fullPage: true })
    const fieldsBefore = await page.locator('[data-field-key]:visible').count()
    const allElementsBefore = await page.locator('fieldset:visible, label:visible').count()
    console.log(
      `[PRE] data-field-key visible: ${fieldsBefore}, fieldsets+labels: ${allElementsBefore}`
    )

    // Search "title"
    await searchInput.fill('title')
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'test-results/02-campaign-title.png', fullPage: true })

    const fieldsAfter = await page.locator('[data-field-key]:visible').count()
    const allElementsAfter = await page.locator('fieldset:visible, label:visible').count()
    const matchBadge = await page.locator('text=/\\d+ match/').count()
    const searchHighlights = await page.locator('[data-search-match]').count()
    const ringHighlights = await page.locator('.search-highlight-ring').count()

    console.log(
      `[TITLE] data-field-key visible: ${fieldsAfter}, fieldsets+labels: ${allElementsAfter}`
    )
    console.log(
      `[TITLE] match badge: ${matchBadge}, [data-search-match]: ${searchHighlights}, .search-highlight-ring: ${ringHighlights}`
    )

    // Check active tab
    const activeTabs = await page.locator('[role="tab"][data-state="active"]').allTextContents()
    console.log(`[TITLE] active tabs: ${activeTabs.map((t) => t.trim()).join(', ')}`)

    // Search gibberish
    await searchInput.fill('xyznonexistent123')
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'test-results/03-campaign-noresults.png', fullPage: true })

    const noResultsMsg = await page.locator('text=/No fields match/').count()
    const clearSearchBtn = await page.locator('text=Clear search').count()
    console.log(`[NORESULTS] "No fields match": ${noResultsMsg}, "Clear search": ${clearSearchBtn}`)

    // Clear
    if (clearSearchBtn > 0) {
      await page.locator('text=Clear search').click()
    } else {
      await searchInput.fill('')
    }
    await page.waitForTimeout(300)
    await page.screenshot({ path: 'test-results/04-campaign-cleared.png', fullPage: true })
    const fieldsCleared = await page.locator('[data-field-key]:visible').count()
    console.log(`[CLEAR] data-field-key visible: ${fieldsCleared} (was ${fieldsBefore})`)
  })

  test('Form: search "gift aid" across tabs', async ({ page }) => {
    await page.goto(FORM_URL)
    await page
      .waitForSelector('input[placeholder="Search fields..."]', { timeout: 15000 })
      .catch(() => {
        console.log('[FORM] No search input found - page may not have loaded')
      })
    await page.waitForTimeout(1000)

    const searchInput = page.locator('input[placeholder="Search fields..."]')
    if ((await searchInput.count()) === 0) {
      await page.screenshot({ path: 'test-results/05-form-nosearch.png', fullPage: true })
      const bodyText = await page.locator('body').innerText()
      console.log(`[FORM] Page text: ${bodyText.slice(0, 300)}`)
      return
    }

    // Pre-search
    await page.screenshot({ path: 'test-results/05-form-before.png', fullPage: true })

    // Search "gift aid"
    await searchInput.fill('gift aid')
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'test-results/06-form-giftaid.png', fullPage: true })

    // Use .first() to handle multiple tab systems on page
    const activeTopTab = await page
      .locator('[role="tab"][data-state="active"]')
      .first()
      .textContent()
    console.log(`[FORM-GIFTAID] First active tab: "${activeTopTab?.trim()}"`)

    const matchBadge = await page.locator('text=/\\d+ match/').count()
    const searchHighlights = await page.locator('.search-highlight-ring').count()
    console.log(
      `[FORM-GIFTAID] match badge: ${matchBadge}, .search-highlight-ring: ${searchHighlights}`
    )

    // Tab match count badges
    const tabBadges = await page.locator('[role="tab"] .text-xs').allTextContents()
    console.log(`[FORM-GIFTAID] tab badges: ${tabBadges.join(', ')}`)
  })
})
