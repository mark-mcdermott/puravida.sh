# The hero loop — the whole pitch in ten seconds. Render with:  vhs scripts/hero.tape
# Needs `puravida` on PATH; the setup below prefers an installed copy and falls
# back to a sibling checkout. Window chrome is drawn in CSS, not here, so this
# renders bare.

Output "public/media/hero.webm"
Output "public/media/hero.mp4"

Set Shell "bash"
Set FontSize 19
Set Width 1280
Set Height 560
Set Padding 28
Set Margin 0
Set TypingSpeed 42ms
Set Theme { "name": "puravida", "background": "#0E2A34", "foreground": "#E8E0D2", "cursor": "#E0B75C", "selection": "#1D4A59", "black": "#0A2029", "red": "#D9714F", "green": "#9FB07A", "yellow": "#E0B75C", "blue": "#5FA8C4", "magenta": "#C98BA0", "cyan": "#6FC5D4", "white": "#E8E0D2", "brightBlack": "#4A6672", "brightRed": "#E68B6B", "brightGreen": "#B4C495", "brightYellow": "#EFCD7E", "brightBlue": "#7FC0D8", "brightMagenta": "#DBA5B7", "brightWhite": "#FBF7EF" }

Hide
Type "export PATH=$HOME/.local/bin:$HOME/Dev/puravida-proj/puravida:/opt/homebrew/bin:/usr/bin:/bin" Enter
Type "cd $(mktemp -d)" Enter
Type `export PS1='🌴 \[\e[38;5;179m\]puravida\[\e[0m\] \[\e[38;5;80m\]❯\[\e[0m\] '` Enter
Type "clear" Enter
Show

Sleep 900ms

Type "# the old way — two commands, and you have to remember the -p" Enter
Sleep 400ms
Type "mkdir -p src/components" Sleep 200ms Enter
Type "touch src/components/Button.tsx" Sleep 200ms Enter
Sleep 900ms
Enter

Type "# or just one" Enter
Sleep 400ms
Type "puravida src/components/Button.tsx" Sleep 300ms Enter
Sleep 600ms
Type "tree" Enter
Sleep 3200ms
