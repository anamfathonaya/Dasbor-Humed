# Design System & Theme Tokens

## Part 1 — Compact Token Summary

### Color Palette
- **Primary / Brand**: `#0284c7` (Sky 600), `#0369a1` (Sky 700), `#38bdf8` (Sky 400)
- **Background**: `#f8fafc` (Slate 50), Dark: `#0f172a` (Slate 900)
- **Card Surface**: `#ffffff` (White), Dark: `#1e293b` (Slate 800)
- **Muted Surface**: `#f1f5f9` (Slate 100), Dark: `#334155` (Slate 700)
- **Border**: `#e2e8f0` (Slate 200), Dark: `#334155` (Slate 700)
- **Text Main**: `#0f172a` (Slate 900), Dark: `#f8fafc` (Slate 50)
- **Text Muted**: `#64748b` (Slate 500), Dark: `#94a3b8` (Slate 400)
- **Success / Badge Up**: `#16a34a` (Green 600), Bg: `rgba(22, 163, 74, 0.1)`
- **Warning / Badge Warn**: `#d97706` (Amber 600), Bg: `rgba(217, 119, 6, 0.1)`
- **Danger / Badge Down**: `#dc2626` (Red 600), Bg: `rgba(220, 38, 38, 0.1)`

### Typography
- **Font Body**: Plus Jakarta Sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Font Heading**: Plus Jakarta Sans, Outfit, system-ui, sans-serif
- **Scale**:
  - `heading-lg`: 2rem (32px), weight 700, leading 1.15, tracking -0.025em
  - `heading-md`: 1.5rem (24px), weight 700, leading 1.2, tracking -0.02em
  - `heading-sm`: 1.25rem (20px), weight 600, leading 1.3, tracking -0.01em
  - `body-lg`: 1.125rem (18px), weight 400, leading 1.6
  - `body-md`: 1rem (16px), weight 400, leading 1.5
  - `body-sm`: 0.875rem (14px), weight 400, leading 1.5
  - `caption`: 0.75rem (12px), weight 400, leading 1.5

### Layout & Spacing
- **Sidebar Width**: 260px (desktop), collapsible on mobile with scrim overlay
- **Top Header Height**: 64px
- **Card Radius**: `0.75rem` (12px)
- **Card Shadow**: `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)`
- **Breakpoints**: sm: 640px, md: 768px, lg: 1024px, xl: 1280px

## Part 2 — Raw Source Dumps

```css
:root {
  --color-primary: #0284c7;
  --color-primary-hover: #0369a1;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-surface-muted: #f1f5f9;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-muted: #64748b;
  --radius-card: 0.75rem;
  --radius-btn: 0.5rem;
}

[data-theme="dark"] {
  --color-primary: #38bdf8;
  --color-primary-hover: #0ea5e9;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface-muted: #334155;
  --color-border: #334155;
  --color-text: #f8fafc;
  --color-muted: #94a3b8;
}
```
