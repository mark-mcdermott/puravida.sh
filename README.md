# puravida.sh

Landing page for [`puravida`](https://github.com/mark-mcdermott/puravida) — a tiny Bash script
that creates files and directories in one command.

Astro · Tailwind v4 · static · deployed on Vercel.

```bash
pnpm install
pnpm dev
```

## Content is generated, not written

The version, usage table, options, exit codes and before/after samples on the page are pulled
from the CLI's own repo at its latest release tag:

```bash
pnpm sync
```

This writes `src/data/cli.json`, which is committed. Don't edit it by hand — edit the CLI's
README and re-sync. CI re-runs the sync daily and whenever a new `puravida` release fires a
`cli-release` dispatch, so the site can't drift from the tool.

## Checks

```bash
pnpm check   # typecheck
pnpm test    # build + playwright (layout overflow, theme, synced content)
```

MIT licensed.
