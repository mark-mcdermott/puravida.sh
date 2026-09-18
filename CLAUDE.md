# puravida.sh

The landing page for [puravida](https://github.com/mark-mcdermott/puravida), the Bash
file-and-directory CLI. Astro 7 · Tailwind v4 · static · Vercel.

Stack: the unnamed **Astro-only** bucket (`mm.coffee`, `markmcdermott.io`, `floating.is`,
`retireat55.club`). `_PROJECTS.md` flags that missing acronym as a known gap; `stack` is set
to `astro` pending the taxonomy rewrite.

## The one rule: the site does not own its content

Everything factual on the page — version, usage table, options, exit codes, the before/after
samples — comes from `src/data/cli.json`, which is **generated**, not written.

```bash
pnpm sync    # scripts/sync-cli.mjs
```

It reads the CLI repo at its **latest release tag** (not `main`, so the page documents what
people can actually install) and parses:

| Source | Becomes |
| --- | --- |
| `VERSION="…"` in the `puravida` script | `version` |
| `### Options` table | `options` |
| `### Exit status` table | `exitCodes` |
| `## Usage` table | `usage` |
| fenced blocks under `## What it replaces` | `replaces` |
| `CHANGELOG.md` headings | `changelog` (`Unreleased` filtered out) |

`generatedAt` is deliberately excluded from change detection: it moves on every
run, so rewriting unconditionally would defeat the workflow's "commit only if the
CLI moved" guard and land a junk commit — and a production deploy — every night.
The sync leaves the file untouched when nothing meaningful changed.

**Never hand-edit `src/data/cli.json`** — edit the CLI's README and re-sync. If the README's
headings or tables are restructured, `pnpm sync` throws rather than emitting a half-empty
page, and `.github/workflows/sync.yml` goes red. That failure is the feature.

The committed JSON is what builds read, so a network blip can never break a deploy — it can
only leave the site a release behind, which the daily cron then catches.

### How a release reaches the site

`puravida`'s release workflow fires a `repository_dispatch` (`cli-release`) at this repo →
`sync.yml` re-syncs, typechecks, builds, and pushes the new `cli.json` → Vercel deploys on
the push. A daily cron is the backstop. **This dispatch step is not yet added to the CLI
repo** — see "Outstanding" below.

## Commands

```bash
pnpm dev       # astro dev
pnpm build     # astro build
pnpm check     # astro check — typecheck .astro/.ts
pnpm test      # build + playwright
pnpm sync      # regenerate src/data/cli.json from the CLI's latest release
node scripts/shoot.mjs http://localhost:4332/ shots    # full-page screenshots, both themes
```

## Design

The palette is **sampled from `illustration.jpg`**, so the page and the artwork are one
system. Deep ocean `#245666`, terracotta `#B25635`, gold `#C7A044`, palm `#787E56`, warm ink
`#36322D`. Contrast ratios are noted inline in `src/styles/globals.css`; **gold is decorative
only** (2.3:1 on paper — never text).

The hero is a **waterline**: a warm sunlit panel holding the island, the dark terminal below
it — the same split the illustration's own cube makes. That panel stays warm in **both**
themes on purpose: the artwork has a baked sunlit drop shadow that only reads correctly on a
light ground. Don't "fix" it to follow the theme.

Components read semantic tokens (`--bg`, `--fg`, `--terminal-bg`, …), never raw palette
colours, so the dark theme is one block of overrides.

## Traps worth knowing

- **Astro strips whitespace containing a newline next to an inline element.** Putting
  `<code>` on its own source line silently deletes the space before it ("README at`v2.1.1`").
  Keep inline code on the same source line as its neighbours, or use `{' '}`.
- **Don't wrap generated terminal output in `<pre>`.** Template indentation becomes real
  indentation. `CommandLines.astro` keeps each row's markup on one source line for this
  reason.
- **Flex/grid children default to `min-width: auto`** and will not shrink below their content,
  which is what pushed the mobile layout 37px wide. `min-w-0` on the shrinkable child.
- **`astro preview` daemonizes** — it prints, exits 0, and keeps serving. Playwright's
  built-in `webServer` reads that exit as a crash, so the server is started and
  stopped in `tests/global-setup.ts` / `global-teardown.ts` instead. There is no
  foreground flag; `--background` is the default now.
- The island is **460×510 — there is no higher-resolution original**. It renders at 260px
  CSS (~1.45x, not true retina). A vector or hi-res redo is the highest-leverage brand fix.

## The demo video

`public/media/demo.*` is generated from `scripts/demo.tape`:

```bash
pnpm build:demo
```

It is committed, and only needs regenerating when the CLI's behaviour changes.

**VHS 0.12 cannot encode on this toolchain.** It records frames correctly, then
exits 0 having produced no file and without ever invoking ffmpeg. So
`scripts/build-demo.mjs` takes the frames and encodes them itself, which also
lets us control padding — the window chrome is CSS, not baked into the video.

Three VHS traps, all of which cost real time:

- **ASCII only in a `Type` line.** One em dash silently scrambles that line and
  every line after it (`the old — two commands` came out as `the old  two
  commands … -pway`).
- **No backticks or escape codes in a `Type` line.** A `PS1` built from
  `\[\e[38;5;179m\]` got mangled and swallowed the following command, so `clear`
  never ran and the hidden setup stayed on screen for the whole recording. The
  prompt is now a plain `$`, which also matches the HTML terminal on the page.
- **`Output "frames/"` fails if the directory already exists** — silently, exit 0.
  `build-demo.mjs` renders into a fresh temp dir for this reason.

## Domains

`puravida.sh` is the canonical host and `www` 308-redirects to it. That has to stay
matched to `site` in `astro.config.mjs`, which feeds `<link rel="canonical">`,
`og:url`, and both the sitemap and `public/robots.txt`. If the primary domain is
ever flipped in Vercel, change `site` in the same commit.

The GitHub repo is connected to the Vercel project, so a push to `main` deploys —
which is what makes the sync workflow reach production.

## Outstanding

- The `repository_dispatch` step is wired into the CLI repo's release workflow; it
  needs a `SITE_DISPATCH_TOKEN` secret there with write access to this repo.
