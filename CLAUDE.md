# Website Projekt - Claude Code Konfiguration

## Verfügbare Slash Commands

| Command | Beschreibung | Verwendung |
|---------|--------------|------------|
| `/review-html` | HTML-Struktur und A11y prüfen | `/review-html src/index.html` |
| `/optimize-css` | CSS optimieren | `/optimize-css src/styles/main.css` |
| `/audit-js` | JavaScript analysieren | `/audit-js src/app.js performance` |
| `/design-check` | Design-Konsistenz prüfen | `/design-check src/components/header` |
| `/create-component` | Neue Komponente erstellen | `/create-component Button button` |
| `/test-page` | Seite umfassend testen | `/test-page src/pages/home.html` |
| `/deploy-check` | Pre-Deployment Checkliste | `/deploy-check` |

## Spezialisierte Agenten

| Agent | Einsatzbereich |
|-------|----------------|
| **HTML/CSS Spezialist** | Semantik, Styling, Accessibility |
| **JS Performance Expert** | JavaScript-Optimierung, Bundle-Analyse |
| **QA Strategist** | Teststrategien, Testfälle |
| **UX Designer** | User Experience, Interface Design |
| **SEO Spezialist** | Suchmaschinenoptimierung, Web Vitals |

## Automatische Skills

Diese Skills werden automatisch aktiviert wenn relevant:

- **Web Performance Analyzer** - Bei Performance-Diskussionen
- **Accessibility Checker** - Bei HTML/Formular-Bearbeitung
- **Component Test Generator** - Bei neuen Komponenten

## Projekt-Konventionen

### Dateistruktur
```
src/
├── index.html          # Hauptseite
├── pages/              # Weitere Seiten
├── components/         # Wiederverwendbare Komponenten
├── styles/             # CSS-Dateien
│   ├── variables.css   # CSS Custom Properties
│   ├── base.css        # Reset & Grundstyles
│   └── components/     # Komponenten-Styles
├── scripts/            # JavaScript
│   ├── main.js         # Haupt-Entry
│   └── modules/        # JS-Module
└── assets/             # Bilder, Fonts, etc.
```

### Naming Conventions
- **CSS Klassen**: BEM (Block__Element--Modifier)
- **JavaScript**: camelCase für Variablen, PascalCase für Klassen
- **Dateien**: kebab-case (mein-component.js)

### Design Tokens
```css
:root {
  /* Farben */
  --color-primary: #...;
  --color-secondary: #...;

  /* Spacing (8px Grid) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Typography */
  --font-family: ...;
  --font-size-base: 16px;
}
```

## Qualitätsstandards

- WCAG 2.1 Level AA
- Lighthouse Score > 90
- Mobile-First Responsive
- Semantisches HTML5
