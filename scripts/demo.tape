# The full feature tour. Same constraints as hero.tape: ASCII only, and no
# backticks or escape codes inside a Type line.
#
# The inline-content example deliberately uses single quotes only. The README's
# version quotes an @import containing double quotes, which cannot be expressed
# in a VHS Type line without escaping that the parser rejects.

Output "frames/"

Set Shell "bash"
Set FontSize 18
Set Width 1280
Set Height 520
Set Padding 28
Set Margin 0
Set TypingSpeed 40ms
Set Theme { "name": "puravida", "background": "#0E2A34", "foreground": "#E8E0D2", "cursor": "#E0B75C", "selection": "#1D4A59", "black": "#0A2029", "red": "#D9714F", "green": "#9FB07A", "yellow": "#E0B75C", "blue": "#5FA8C4", "magenta": "#C98BA0", "cyan": "#6FC5D4", "white": "#E8E0D2", "brightBlack": "#4A6672", "brightRed": "#E68B6B", "brightGreen": "#B4C495", "brightYellow": "#EFCD7E", "brightBlue": "#7FC0D8", "brightMagenta": "#DBA5B7", "brightWhite": "#FBF7EF" }

Hide
Type "export PATH=$HOME/.local/bin:$HOME/Dev/puravida-proj/puravida:/opt/homebrew/bin:/usr/bin:/bin"
Enter
Type "cd $(mktemp -d)"
Enter
Type "PS1='$ '"
Enter
Type "clear"
Enter
Show

Sleep 800ms

Type "# one command, not two. parents are made for you"
Enter
Type "puravida src/components/Button.tsx"
Enter
Sleep 900ms

Type "# a dot makes a file, no dot makes a directory"
Enter
Type "puravida a.txt b.txt assets/"
Enter
Sleep 900ms

Type "# a leading directory holds the paths after it"
Enter
Type "puravida .config/ settings.json themes/dark.css"
Enter
Sleep 400ms
Type "tree -a --noreport"
Enter
Sleep 2600ms
Type "clear"
Enter

Type "# inline content goes after the ~~ marker"
Enter
Type "puravida notes.txt ~~ hello, world"
Enter
Type "cat notes.txt"
Enter
Sleep 1600ms

Type "# single-quote anything with braces or semicolons"
Enter
Type "puravida app.css ~~ 'body { margin: 0; }'"
Enter
Type "cat app.css"
Enter
Sleep 1800ms

Type "# -f forces dotless names to be files"
Enter
Type "puravida -f Makefile LICENSE"
Enter
Type "ls"
Enter
Sleep 1800ms
Type "clear"
Enter

Type "# a bare ~ takes multi-line input, ending on a lone ~"
Enter
Type "puravida haiku.txt ~"
Enter
Sleep 400ms
Type "code flows like water"
Enter
Type "folders bloom across the disk"
Enter
Type "pura vida, friend"
Enter
Type "~"
Enter
Sleep 500ms
Type "cat haiku.txt"
Enter
Sleep 3000ms
