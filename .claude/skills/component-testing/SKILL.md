---
name: Component Test Generator
description: |
  Generiert automatisch Testfälle für Web-Komponenten.
  Wird aktiviert bei: Neue Komponenten, Refactoring,
  oder wenn Tests diskutiert werden.
allowed-tools:
  - Read
  - Write
  - Grep
---

# Component Test Generator

Generiere automatisch Tests wenn neue Komponenten erstellt werden.

## Test-Kategorien

### 1. Render Tests
```javascript
describe('Component renders', () => {
  it('should render without crashing', () => {
    // Mount component
    // Assert no errors
  });

  it('should render with default props', () => {
    // Mount with defaults
    // Assert expected output
  });
});
```

### 2. Props Tests
```javascript
describe('Component props', () => {
  it('should apply className prop', () => {});
  it('should handle onClick prop', () => {});
  it('should render children', () => {});
});
```

### 3. State Tests
```javascript
describe('Component state', () => {
  it('should update on user interaction', () => {});
  it('should reset when prop changes', () => {});
});
```

### 4. Accessibility Tests
```javascript
describe('Component accessibility', () => {
  it('should have no a11y violations', async () => {
    // Use axe-core or similar
  });

  it('should be keyboard navigable', () => {});
  it('should have proper ARIA labels', () => {});
});
```

### 5. Edge Cases
```javascript
describe('Edge cases', () => {
  it('should handle empty data', () => {});
  it('should handle null/undefined props', () => {});
  it('should handle very long content', () => {});
});
```

## Test-Datei Struktur
```
src/
  components/
    Button/
      Button.js
      Button.test.js  <- Generiert
      Button.css
```

## Naming Convention
- `describe`: Komponenten-Name
- `it`: "should [erwartetes Verhalten]"
