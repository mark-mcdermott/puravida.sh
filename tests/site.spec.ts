import { test, expect } from '@playwright/test'
import cli from '../src/data/cli.json' with { type: 'json' }

test.describe('content stays in step with the CLI', () => {
  test('renders the synced version', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header').getByText(`v${cli.version}`, { exact: true })).toBeVisible()
  })

  test('renders every usage row from cli.json', async ({ page }) => {
    await page.goto('/')
    const rows = page.locator('#usage table tbody tr')
    await expect(rows).toHaveCount(cli.usage.length)
    await expect(rows.first()).toContainText(cli.usage[0]!.command)
  })

  test('renders every option and exit code', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#usage dl').first().locator('> div')).toHaveCount(
      cli.options.length,
    )
    await expect(page.locator('#usage dl').nth(1).locator('> div')).toHaveCount(
      cli.exitCodes.length,
    )
  })

  test('heredoc bodies are not shown as shell commands', async ({ page }) => {
    await page.goto('/')
    // Lines after `cat > … << 'END'` (and after a trailing `~`) are typed input,
    // not commands — prompting them would misrepresent how the tool works.
    const rows = await page.locator('#why div.whitespace-pre').allTextContents()

    const commands = rows.filter((line) => line.includes('mkdir -p folder'))
    expect(commands.length).toBeGreaterThan(0)
    for (const line of commands) expect(line.trimStart().startsWith('$')).toBe(true)

    const bodies = rows.filter((line) => line.includes('first line'))
    expect(bodies.length).toBeGreaterThan(0)
    for (const line of bodies) expect(line.trimStart().startsWith('$')).toBe(false)
  })
})

test.describe('layout', () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      const { clientWidth, scrollWidth } = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }))
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  }

  for (const width of [320, 375, 768, 1440]) {
    test(`the sticky header does not cover the headline at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)

      // Measured on a fresh load, so the page is genuinely at the top. The root
      // sets scroll-behavior: smooth, so measuring after a programmatic scroll
      // reads a position mid-flight and reports an overlap that is not there.
      const { headerBottom, headlineTop, scrollY } = await page.evaluate(() => ({
        headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
        headlineTop: document.querySelector('h1')!.getBoundingClientRect().top,
        scrollY: window.scrollY,
      }))
      expect(scrollY).toBe(0)
      expect(headlineTop).toBeGreaterThanOrEqual(headerBottom)
    })
  }
})

test.describe('the install command is never cut off', () => {
  // The pill is narrower than the brew command on a phone. It wraps rather than
  // scrolling: a scrolled line reads as truncated, because nothing shows there
  // is more until you try, and the copy button sits over the cut.
  const COMMAND = 'brew install mark-mcdermott/tap/puravida'

  for (const width of [320, 375, 768, 1440]) {
    test(`shows the whole command at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)

      const state = await page.locator('.command-text').first().evaluate((el) => ({
        clippedHorizontally: el.scrollWidth > el.clientWidth + 1,
        text: el.textContent?.trim(),
      }))

      expect(state.clippedHorizontally).toBe(false)
      expect(state.text).toBe(COMMAND)
    })
  }

  test('wraps onto another line rather than hiding the end', async ({ page }) => {
    const heightAt = async (width: number) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.evaluate(() => document.fonts.ready)
      return page
        .locator('.command-text')
        .first()
        .evaluate((el) => el.getBoundingClientRect().height)
    }

    const wide = await heightAt(1440)
    const narrow = await heightAt(320)
    expect(narrow).toBeGreaterThan(wide)
  })
})

test.describe('theme', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`exactly one toggle icon is visible in ${theme}`, async ({ page }) => {
      await page.goto('/')
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
      const visible = await page.locator('#theme-toggle svg').evaluateAll((nodes) =>
        nodes.filter((n) => getComputedStyle(n).display !== 'none').length,
      )
      expect(visible).toBe(1)
    })

    test(`the terminal is distinguishable from the page in ${theme}`, async ({ page }) => {
      await page.goto('/')
      await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme)
      const [pageBg, terminalBg] = await page.evaluate(() => {
        const terminal = document.querySelector('#top .rounded-card.border')!
        return [getComputedStyle(document.body).backgroundColor, getComputedStyle(terminal).backgroundColor]
      })
      expect(terminalBg).not.toBe(pageBg)
    })
  }

  test('the toggle flips and persists the choice', async ({ page }) => {
    await page.goto('/')
    const before = await page.evaluate(() => document.documentElement.dataset.theme ?? null)
    await page.locator('#theme-toggle').click()
    const after = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(after).not.toBe(before)
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(after)
  })
})

test('the demo is a video with both encodings and a poster', async ({ page }) => {
  await page.goto('/')
  const video = page.locator('#demo video')
  await expect(video).toHaveAttribute('poster', /demo-poster\.png$/)
  await expect(video).toHaveAttribute('muted', '')
  await expect(video.locator('source[type="video/mp4"]')).toHaveCount(1)
  await expect(video.locator('source[type="video/webm"]')).toHaveCount(1)
})

test('the install command is on the copy button', async ({ page }) => {
  await page.goto('/')
  const button = page.locator('.copy-command').first()
  await expect(button).toHaveAttribute('data-command', /^brew install /)
})

test('robots.txt points at the sitemap on the canonical host', async ({ page }) => {
  const res = await page.request.get('/robots.txt')
  expect(res.status()).toBe(200)
  const body = await res.text()
  // The canonical host here must match astro.config's `site`, or the sitemap
  // reference and the page's own <link rel="canonical"> disagree.
  expect(body).toContain('Sitemap: https://puravida.sh/sitemap-index.xml')
})

test('inline links keep the space in front of them', async ({ page }) => {
  await page.goto('/')
  // Astro strips whitespace containing a newline next to an inline element, so
  // an <a> or <code> on its own source line silently loses the space before it.
  // This has now bitten twice: "README at`v2.1.1`" and "Created byMark McDermott".
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
  expect(body).toContain('Created by Mark McDermott')
  expect(body).toContain(`README at v${cli.version}`)
})

test('no console errors', async ({ page }) => {
  const errors: string[] = []
  // Vercel's analytics and speed-insights scripts are served by the platform,
  // so they 404 anywhere but a real deployment. That is expected off-Vercel.
  const fromVercelRuntime = (text: string) => text.includes('_vercel/')

  page.on('response', (r) => {
    if (r.status() >= 400 && !fromVercelRuntime(r.url())) {
      errors.push(`${r.status()} ${r.url()}`)
    }
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) {
      errors.push(m.text())
    }
  })
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/', { waitUntil: 'networkidle' })
  expect(errors).toEqual([])
})
