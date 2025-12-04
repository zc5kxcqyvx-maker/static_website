# STASIC Website - Claude Code Konfiguration

## Das Team (Opus 4.5)

Unser virtuelles Agentur-Team arbeitet wie eine echte Design-Firma:

```
                    ┌─────────────────────┐
                    │  CREATIVE DIRECTOR  │
                    │   (Head of Design)  │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌───────────────┐
│  UX Designer  │    │  UI Engineer /  │    │   Frontend    │
│               │    │ Visual Developer│    │   Engineer    │
└───────────────┘    └─────────────────┘    └───────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                                             │
        ▼                                             ▼
┌───────────────┐                           ┌─────────────────┐
│  QA Engineer  │                           │ SEO & Growth    │
│               │                           │   Specialist    │
└───────────────┘                           └─────────────────┘
```

### Agenten-Übersicht

| Agent | Rolle | Verantwortung |
|-------|-------|---------------|
| **Creative Director** | Head of Design | Strategische Vision, Brand Identity, Design-Entscheidungen |
| **UX Designer** | User Experience | Nutzerforschung, User Flows, Accessibility |
| **UI Engineer** | Visual Developer | CSS, Animationen, Design-System Umsetzung |
| **Frontend Engineer** | JavaScript Dev | Interaktivität, Performance, Web APIs |
| **QA Engineer** | Quality Assurance | Testing, Bug-Hunting, Cross-Browser |
| **SEO Specialist** | Growth | Technical SEO, Web Vitals, Suchoptimierung |

## Slash Commands

| Command | Beschreibung | Beispiel |
|---------|--------------|----------|
| `/review-html` | HTML-Struktur und A11y prüfen | `/review-html src/index.html` |
| `/optimize-css` | CSS optimieren | `/optimize-css src/styles/main.css` |
| `/audit-js` | JavaScript analysieren | `/audit-js src/scripts/main.js performance` |
| `/design-check` | Design-Konsistenz prüfen | `/design-check src/components/header` |
| `/create-component` | Neue Komponente erstellen | `/create-component Button button` |
| `/test-page` | Seite umfassend testen | `/test-page src/index.html` |
| `/deploy-check` | Pre-Deployment Checkliste | `/deploy-check` |

## Automatische Skills

Diese Skills werden automatisch aktiviert wenn relevant:

- **Web Performance Analyzer** - Bei Performance-Diskussionen
- **Accessibility Checker** - Bei HTML/Formular-Bearbeitung
- **Component Test Generator** - Bei neuen Komponenten

## Projekt-Konventionen

### Dateistruktur
```
src/
├── index.html              # Hauptseite
├── impressum.html          # Impressum
├── datenschutz.html        # Datenschutz
├── 404.html                # Error Page
├── styles/
│   ├── main.css            # Legacy Styles
│   └── retro-globe.css     # Aktuelle Styles
├── scripts/
│   ├── main.js             # Legacy JS
│   └── retro-globe.js      # Aktuelle Funktionalität
└── assets/
    ├── images/             # Bilder
    ├── audio/              # Audio Files
    └── favicon.svg         # Favicon
```

### Design Tokens (retro-globe.css)
```css
:root {
    --bg: #0a0a0a;
    --terminal-bg: #050505;
    --green: #00ff41;
    --green-dim: #00aa2a;
    --green-glow: rgba(0, 255, 65, 0.3);
    --amber: #ffb000;
    --red: #ff0040;
    --font-terminal: 'VT323', monospace;
    --font-mono: 'Share Tech Mono', monospace;
}
```

### Naming Conventions
- **CSS Klassen**: Beschreibend, keine Abkürzungen
- **JavaScript**: camelCase für Variablen, PascalCase für Klassen
- **Dateien**: kebab-case (mein-component.js)

## Qualitätsstandards

- WCAG 2.1 Level AA
- Lighthouse Score > 90
- Mobile-First Responsive
- Semantisches HTML5
- 60fps Animationen

## Deployment

- **Hosting**: Cloudflare Pages
- **Repository**: GitHub (zc5kxcqyvx-maker/static_website)
- **Domain**: stasic.net
- **Auto-Deploy**: Bei jedem Push auf main
