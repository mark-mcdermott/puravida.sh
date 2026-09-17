/**
 * Renders scripts/hero.tape and encodes it to web video.
 *
 * VHS 0.12 records frames correctly but its own encoder never runs on this
 * toolchain (it exits 0 having produced nothing and without ever invoking
 * ffmpeg), so we take the frames and encode them ourselves. That also lets us
 * control padding, since window chrome is drawn in CSS rather than baked in.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, rm, readdir, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = join(root, 'public/media')

// name -> tape. `pnpm build:demo demo` renders just one.
const TAPES = { demo: 'scripts/demo.tape' }
const requested = process.argv.slice(2)
const selected = requested.length ? requested : Object.keys(TAPES)

const FPS = 50
const PAD = 28
const BG = '0x0E2A34' // the tape's own theme background

async function render(name) {
  const tape = join(root, TAPES[name])
  if (!tape) throw new Error(`unknown tape: ${name}`)
  const work = await mkdtemp(join(tmpdir(), `puravida-${name}-`))
  const frames = join(work, 'frames')

  try {
    // VHS silently refuses to write into a directory that already exists, and
    // it resolves `Output "frames/"` relative to the working directory.
    await run('vhs', [tape], { cwd: work })

    const files = await readdir(frames).catch(() => [])
    const textFrames = files.filter((f) => f.startsWith('frame-text-')).length
    if (textFrames === 0) throw new Error(`vhs produced no frames in ${frames}`)
    console.log(`\n${name}: recorded ${textFrames} frames`)

    const probe = await run('magick', [
      join(frames, 'frame-text-00001.png'),
      '-format',
      '%w %h',
      'info:',
    ])
    const [w, h] = probe.stdout.trim().split(' ').map(Number)
    // yuv420p needs even dimensions.
    const outW = (w + PAD * 2) % 2 === 0 ? w + PAD * 2 : w + PAD * 2 + 1
    const outH = (h + PAD * 2) % 2 === 0 ? h + PAD * 2 : h + PAD * 2 + 1
    const filter = `[0][1]overlay=format=auto,pad=${outW}:${outH}:${PAD}:${PAD}:color=${BG}`

    await mkdir(outDir, { recursive: true })

    const inputs = [
      '-framerate', String(FPS), '-start_number', '1',
      '-i', join(frames, 'frame-text-%05d.png'),
      '-framerate', String(FPS), '-start_number', '1',
      '-i', join(frames, 'frame-cursor-%05d.png'),
    ]

    await run('ffmpeg', [
      '-y', '-loglevel', 'error', ...inputs,
      '-filter_complex', `${filter},format=yuv420p`,
      '-c:v', 'libx264', '-crf', '24', '-preset', 'veryslow',
      '-movflags', '+faststart',
      join(outDir, `${name}.mp4`),
    ])
    console.log(`✓ public/media/${name}.mp4`)

    await run('ffmpeg', [
      '-y', '-loglevel', 'error', ...inputs,
      '-filter_complex', `${filter},format=yuv420p`,
      '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1',
      join(outDir, `${name}.webm`),
    ])
    console.log(`✓ public/media/${name}.webm`)

    // A poster so the card is never an empty box before the video decodes.
    await run('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-i', join(frames, `frame-text-${String(textFrames).padStart(5, '0')}.png`),
      '-vf', `pad=${outW}:${outH}:${PAD}:${PAD}:color=${BG}`,
      join(outDir, `${name}-poster.png`),
    ])
    console.log(`✓ public/media/${name}-poster.png`)
    console.log(`  ${outW}x${outH}`)
  } finally {
    await rm(work, { recursive: true, force: true })
  }
}

async function main() {
  for (const name of selected) await render(name)
}

main().catch((err) => {
  console.error(`✗ ${err.message}`)
  process.exit(1)
})
