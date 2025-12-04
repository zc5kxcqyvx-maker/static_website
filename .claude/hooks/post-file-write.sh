#!/bin/bash
# Hook: Wird nach jedem Datei-Schreiben ausgeführt
# Formatiert automatisch HTML, CSS und JS Dateien

FILE="$1"

# Prüfe ob Datei existiert
if [ ! -f "$FILE" ]; then
    exit 0
fi

# Auto-Format basierend auf Dateityp
case "$FILE" in
    *.html|*.htm)
        # HTML Validierung (optional mit html-validate)
        if command -v html-validate &> /dev/null; then
            html-validate "$FILE" 2>/dev/null || true
        fi
        ;;
    *.css|*.scss|*.sass)
        # CSS Format mit Prettier oder Stylelint
        if command -v prettier &> /dev/null; then
            prettier --write "$FILE" 2>/dev/null || true
        fi
        ;;
    *.js|*.jsx|*.ts|*.tsx)
        # JavaScript/TypeScript Format
        if command -v prettier &> /dev/null; then
            prettier --write "$FILE" 2>/dev/null || true
        fi
        ;;
esac

exit 0
