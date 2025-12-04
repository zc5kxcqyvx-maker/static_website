---
description: JavaScript-Code auf Performance und Qualität prüfen
argument-hint: [datei-pfad] [fokus: performance|security|quality]
---

Analysiere die JavaScript-Datei `$1` mit Fokus auf `$2`:

## Performance-Analyse
- DOM-Manipulation Optimierung
- Event-Delegation statt vieler Listener
- Debouncing/Throttling bei Scroll/Resize
- Lazy Loading Möglichkeiten
- Memory Leaks (nicht entfernte Listener)

## Security-Check
- XSS-Schwachstellen (innerHTML, eval)
- Sichere DOM-Manipulation
- Input-Validierung
- CORS-Konfiguration

## Code-Qualität
- Moderne ES6+ Syntax
- Error Handling
- Async/Await Patterns
- Code-Duplikation
- Funktionen aufteilen (Single Responsibility)

Gib priorisierte Empfehlungen mit Code-Beispielen.
