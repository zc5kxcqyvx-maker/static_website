---
name: Web Performance Analyzer
description: |
  Analysiert automatisch HTML, CSS und JavaScript auf Performance-Probleme.
  Wird aktiviert bei: Diskussionen über Ladezeiten, Core Web Vitals,
  Performance-Optimierung, oder wenn Dateien mit .html, .css, .js bearbeitet werden.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Web Performance Analyzer

Wenn du Web-Code analysierst, prüfe automatisch auf diese Performance-Aspekte:

## HTML Performance
- Render-blocking Resources im `<head>`
- Zu viele DOM-Elemente (>1500 Warnung)
- Fehlende `loading="lazy"` bei Bildern
- Fehlende `async`/`defer` bei Scripts
- Inline CSS vs. externe Stylesheets

## CSS Performance
- Ungenutzte CSS-Regeln
- Übermäßige Spezifität
- @import Statements (blockieren)
- Große CSS-Dateien (>50KB Warnung)
- Fehlende CSS Containment

## JavaScript Performance
- Synchrone Skripte im `<head>`
- Große Bundle-Größen (>100KB Warnung)
- Fehlende Code-Splitting Möglichkeiten
- DOM-Ready vs. Load Events
- Memory Leaks (Event Listener)

## Core Web Vitals Indikatoren
- LCP: Große Bilder ohne Optimierung
- CLS: Elemente ohne Dimensionen
- FID/INP: Lange JavaScript-Tasks

## Automatische Empfehlungen
Wenn Probleme gefunden werden, schlage sofort Lösungen vor:
- Code-Beispiele für Fixes
- Priorität (kritisch/wichtig/nice-to-have)
- Geschätzter Impact auf Metriken
