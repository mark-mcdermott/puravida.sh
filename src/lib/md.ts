const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c)

/**
 * The CLI's README tables carry inline `code` spans, and that text reaches us
 * over the network from GitHub. Escape first, then promote the backticks — so a
 * `<script>` in a future README renders as text instead of running.
 */
export function inlineCode(text: string): string {
  return escapeHtml(text).replace(
    /`([^`]+)`/g,
    '<code class="whitespace-nowrap rounded bg-[color-mix(in_srgb,var(--fg)_8%,transparent)] px-1.5 py-0.5 font-mono text-[0.9em]">$1</code>',
  )
}

/** Splits a synced code sample into lines, dropping trailing blanks. */
export function lines(block: string): string[] {
  return block.replace(/\s+$/, '').split('\n')
}

export interface TerminalLine {
  text: string
  /** False for heredoc / multiline body, which is typed input rather than a command. */
  isCommand: boolean
}

/**
 * Decides which lines of a sample get a shell prompt. Everything after a
 * `<< 'END'` heredoc or a trailing `~` (puravida's multiline marker) is input
 * the user types, not a command — prompting it would misrepresent the tool.
 */
export function terminalLines(block: string): TerminalLine[] {
  let terminator: string | null = null

  return lines(block).map((text) => {
    if (terminator !== null) {
      if (text.trim() === terminator) terminator = null
      return { text, isCommand: false }
    }

    const heredoc = text.match(/<<\s*'?([A-Za-z_][A-Za-z0-9_]*)'?\s*$/)
    if (heredoc) terminator = heredoc[1]!
    else if (/\s~$/.test(text)) terminator = '~'

    return { text, isCommand: true }
  })
}
