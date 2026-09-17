import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

export default async function globalTeardown() {
  // Only stop the daemon if this run started it.
  if (process.env.PW_OWNS_SERVER !== '1') return
  await run('npx', ['astro', 'preview', 'stop']).catch(() => {})
}
