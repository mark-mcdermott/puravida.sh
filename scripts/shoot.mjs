/**
 * Full-page screenshots at the breakpoints that matter, in both themes.
 * Point it at a running dev server: node scripts/shoot.mjs [url] [outDir]
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const url = process.argv[2] ?? 'http://localhost:4331/'
const outDir = process.argv[3] ?? 'shots'
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()

for (const { name, width, height } of viewports) {
  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width, height } })
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t
      document.documentElement.style.scrollBehavior = 'auto'
    }, theme)
    await page.waitForTimeout(350)
    await page.screenshot({ path: `${outDir}/${name}-${theme}.png`, fullPage: true })
    console.log(`✓ ${outDir}/${name}-${theme}.png`)
    await page.close()
  }
}

await browser.close()
