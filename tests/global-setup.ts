import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { PORT, baseURL } from './server-config'

const run = promisify(execFile)

async function responds(): Promise<boolean> {
  try {
    const res = await fetch(baseURL, { signal: AbortSignal.timeout(1500) })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Astro 7's preview server daemonizes: it prints, exits 0, and keeps serving.
 * Playwright's built-in `webServer` reads that exit as a crash, so the server
 * lifecycle is managed here instead. It only passed before by winning a race
 * between the URL becoming ready and Playwright noticing the exit.
 */
export default async function globalSetup() {
  if (await responds()) {
    // Someone is already previewing on this port; leave it alone.
    process.env.PW_OWNS_SERVER = ''
    return
  }

  await run('npx', ['astro', 'preview', '--port', String(PORT)])
  process.env.PW_OWNS_SERVER = '1'

  for (let i = 0; i < 40; i++) {
    if (await responds()) return
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`preview server never became ready at ${baseURL}`)
}
