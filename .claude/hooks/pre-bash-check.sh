#!/bin/bash
# Hook: Wird vor Bash-Befehlen ausgeführt
# Prüft Umgebungsvoraussetzungen

# Prüfe Node.js (falls benötigt)
check_node() {
    if ! command -v node &> /dev/null; then
        echo "Hinweis: Node.js nicht gefunden. Einige Features könnten fehlen." >&2
    fi
}

# Prüfe npm Dependencies
check_deps() {
    if [ -f "package.json" ] && [ ! -d "node_modules" ]; then
        echo "Hinweis: node_modules fehlt. Führe 'npm install' aus." >&2
    fi
}

# Ausführen
check_node
check_deps

exit 0
