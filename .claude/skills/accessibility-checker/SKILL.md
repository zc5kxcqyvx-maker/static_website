---
name: Accessibility Checker
description: |
  Prüft automatisch auf WCAG 2.1 Level AA Compliance.
  Wird aktiviert bei: HTML-Bearbeitung, Formular-Erstellung,
  interaktive Komponenten, oder wenn Accessibility erwähnt wird.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Accessibility Checker (WCAG 2.1 AA)

Prüfe automatisch auf diese Accessibility-Kriterien:

## Perceivable (Wahrnehmbar)
- [ ] Alle Bilder haben alt-Attribute
- [ ] Alt-Texte sind beschreibend (nicht "image1.jpg")
- [ ] Videos haben Untertitel-Option
- [ ] Farbkontrast mindestens 4.5:1 (Text) / 3:1 (große Text)
- [ ] Information nicht nur durch Farbe vermittelt

## Operable (Bedienbar)
- [ ] Alle interaktiven Elemente per Tastatur erreichbar
- [ ] Fokus-Reihenfolge logisch (tabindex)
- [ ] Fokus-Styles sichtbar (:focus-visible)
- [ ] Skip-Links vorhanden
- [ ] Keine Keyboard-Traps

## Understandable (Verständlich)
- [ ] `lang`-Attribut auf `<html>`
- [ ] Formular-Labels verknüpft
- [ ] Fehlermeldungen beschreibend
- [ ] Konsistente Navigation

## Robust
- [ ] Valides HTML
- [ ] ARIA korrekt verwendet
- [ ] Rollen und States aktuell

## Häufige Probleme
Wenn gefunden, sofort melden:

```html
<!-- SCHLECHT -->
<div onclick="...">Klick mich</div>

<!-- GUT -->
<button type="button" onclick="...">Klick mich</button>
```

```html
<!-- SCHLECHT -->
<img src="logo.png">

<!-- GUT -->
<img src="logo.png" alt="Firmenname Logo">
```

## ARIA Patterns
- Modale: `role="dialog"`, `aria-modal="true"`
- Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- Accordions: `aria-expanded`, `aria-controls`
