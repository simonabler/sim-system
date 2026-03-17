# sims.abler.tirol — Design Guide

> Dieses Dokument definiert das Design-System für `sims.abler.tirol` (SIMSystem).  
> Es leitet sich aus dem ökosystemweiten [abler.tirol Design Guide](https://github.com/simonabler/abler-tirol) ab und konkretisiert es für eine datenintensive, **mobile-first App-Oberfläche**.

---

## 1. Produktcharakter

**sims** ist ein internes Inventur- und Rechnungssystem. Die UI ist primär eine **App-Shell** – kein Marketing, keine Hero-Sections. Der Charakter ist:

- **Sachlich und direkt** – keine Dekoration, keine Erklärungstexte wo keine nötig sind
- **Datenorientiert** – Tabellen, Listen und Formulare sind die Hauptelemente
- **Vertrauenswürdig** – klare Zustände, keine dunklen Muster, keine irreführenden Aktionen
- **Offen und aufgeräumt** – viel Weißraum, klare Hierarchie, kein visuelles Rauschen
- **Mobile-First** – die App wird primär auf dem Handy bedient; jede Komponente beginnt mit dem Mobile-Layout und wird erst danach für Desktop erweitert

Verglichen mit anderen abler.tirol-Produkten: näher an `klara` (ruhig, funktional) als an `api` (technisch-dramatisch).

---

## 2. Farbpalette

### Neutrals (geteilt mit allen abler.tirol-Produkten)

```css
--white:      #ffffff;
--bg-light:   #f7f7f4;   /* App-Hintergrund */
--bg-subtle:  #fbfbf9;   /* Cards, Sidebar, Table-Header */
--ink:        #0f172a;   /* Haupttext, dunkle Buttons */
--ink-2:      #475569;   /* Body-Text, Descriptions, Labels */
--ink-3:      #94a3b8;   /* Placeholders, Muted, Disabled */
--border:     #e2e8f0;   /* Alle Borders, Divider, Table-Lines */
--border-sub: rgba(226, 232, 240, 0.7);
```

### sims-Akzentfarben

sims bekommt eine **blau-schieferfarbene** Identität – ruhig und professionell, nicht zu technisch:

```css
--accent-primary:   #1e3a5f;   /* Deep Blue-Slate – Navbar, aktive Nav, CTAs */
--accent-secondary: #2d5282;   /* Blue 800 – Hover-Zustände */
--accent-highlight: #3b82f6;   /* Blue 500 – Focus-Ringe, aktive Badges, Links */
--accent-light:     #eff6ff;   /* Blue 50 – subtile Hintergründe, selected rows */
--accent-muted:     #dbeafe;   /* Blue 100 – Badge-Hintergründe */
```

### Status-Farben

Status-Farben werden **ausschließlich für Zustände** verwendet (nie als Akzent oder Dekoration):

```css
/* Erfolg */
--status-success:        #059669;   /* Emerald 600 */
--status-success-light:  #ecfdf5;   /* Emerald 50 */
--status-success-border: #6ee7b7;   /* Emerald 300 */

/* Warnung */
--status-warning:        #d97706;   /* Amber 600 */
--status-warning-light:  #fffbeb;   /* Amber 50 */
--status-warning-border: #fcd34d;   /* Amber 300 */

/* Fehler */
--status-error:          #dc2626;   /* Red 600 */
--status-error-light:    #fef2f2;   /* Red 50 */
--status-error-border:   #fca5a5;   /* Red 300 */

/* Neutral / Entwurf */
--status-neutral:        #64748b;   /* Slate 500 */
--status-neutral-light:  #f1f5f9;   /* Slate 100 */
```

---

## 3. Typografie

### Schriftfamilien

Fonts werden **vom eigenen Backend** ausgeliefert (`apps/server`). Das macht sims vollständig standalone – keine Abhängigkeit zu externen Diensten, kein Google Fonts, kein `api.abler.tirol` als Voraussetzung.

Das Backend stellt einen statischen Font-Endpunkt bereit:

```
GET /fonts/abler-stack.css        → kombiniertes CSS mit allen @font-face-Regeln
GET /fonts/files/inter-variable.woff2
GET /fonts/files/dm-serif-display-400.woff2
GET /fonts/files/dm-serif-display-400-italic.woff2
GET /fonts/files/dm-mono-400.woff2
GET /fonts/files/dm-mono-500.woff2
```

**Einbindung in `index.html`:**

```html
<!-- Preconnect zum eigenen Backend -->
<link rel="preconnect" href="/api" />
<link rel="stylesheet" href="/api/fonts/abler-stack.css" />
```

> In der Angular `environment.ts` kann der Font-Pfad konfiguriert werden, falls das Backend auf einem anderen Port oder Host läuft (z. B. `http://localhost:3000/fonts/abler-stack.css` im Development).

**`abler-stack.css` (wird im Backend als statische Datei abgelegt):**

```css
@font-face {
  font-family: 'DM Serif Display';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/api/fonts/files/dm-serif-display-400.woff2') format('woff2');
}
@font-face {
  font-family: 'DM Serif Display';
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url('/api/fonts/files/dm-serif-display-400-italic.woff2') format('woff2');
}
@font-face {
  font-family: 'Inter';
  font-weight: 300 600;
  font-display: swap;
  src: url('/api/fonts/files/inter-variable.woff2') format('woff2');
}
@font-face {
  font-family: 'DM Mono';
  font-weight: 400;
  font-display: swap;
  src: url('/api/fonts/files/dm-mono-400.woff2') format('woff2');
}
@font-face {
  font-family: 'DM Mono';
  font-weight: 500;
  font-display: swap;
  src: url('/api/fonts/files/dm-mono-500.woff2') format('woff2');
}
```

> `font-display: swap` ist Pflicht – verhindert unsichtbaren Text während des Ladens.

### Verwendung

| Rolle | Familie | Verwendung in sims |
|---|---|---|
| **Headlines** | `DM Serif Display` | Seitentitel (H1), leere Zustände |
| **Interface** | `Inter` | Alles andere: Labels, Body, Tabellen, Inputs |
| **Mono** | `DM Mono` | Nummern (Rechnungs-Nr., Artikel-Nr.), Badges, Status-Tags |

### Gewichtungen

```css
font-weight: 300   /* Fließtext, Descriptions */
font-weight: 400   /* Standard Labels, Table-Body */
font-weight: 500   /* Button-Text, Table-Header, Nav-Items */
font-weight: 600   /* Seitentitel H2, wichtige Werte */
```

### Größenraster

Mobile-First: die Basisgrößen gelten für Mobile (`< 768px`), Desktop-Overrides kommen via Media Query.

```css
/* Seitentitel */
--text-page-title:  1.4rem;    /* Mobile – DM Serif Display */
/* @media (min-width: 768px): 1.75rem */

/* Section-Titel */
--text-section:     1rem;      /* Mobile */
/* @media (min-width: 768px): 1.1rem */

/* Body */
--text-body:        1rem;      /* 16px – Mobile, kein Zoomen beim Focus auf iOS */
--text-sm:          0.9375rem; /* 15px – Tabellen, kompakte Listen */
--text-xs:          0.875rem;  /* 14px – Beschriftungen, Hints */

/* Label / Badge */
--text-label:       0.75rem;   /* 12px – DM Mono, uppercase */
--text-micro:       0.6875rem; /* 11px – Status-Badges, Tags */
```

> **Wichtig:** Font-Size auf Inputs niemals unter `16px` auf Mobile setzen – sonst zoomt iOS beim Fokus automatisch rein.

### Typo-Regeln

- Seitentitel nutzen `DM Serif Display`, alle anderen Texte `Inter`
- Rechnungs- und Artikelnummern **immer** in `DM Mono`
- Labels und Badges **immer** `DM Mono`, `text-transform: uppercase`, `letter-spacing: 0.12em`
- Keine System-Fonts, kein `Arial`, kein `Roboto`
- `line-height: 1.6` für Body, `1.1` für Titles

---

## 4. Layout & App-Shell

sims nutzt **Bootstrap 5** als Grid- und Utility-Grundlage. Bootstrap wird **nicht** für fertige Komponenten-Styles verwendet – es liefert ausschließlich das responsive Grid (`container`, `row`, `col-*`), Flexbox-Utilities und Spacing-Utilities. Alle visuellen Stile kommen aus den sims-eigenen CSS-Custom-Properties.

### Bootstrap-Einbindung

```bash
npm install --save bootstrap
```

```scss
// styles.scss – nur das Grid und Utilities importieren, kein vollständiges Bootstrap
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/grid';
@import 'bootstrap/scss/utilities';
@import 'bootstrap/scss/helpers';
```

Bootstrap-Farbvariablen (`$primary`, `$secondary`, etc.) werden **nicht** verwendet – alle Farben kommen aus den sims CSS Custom Properties.

### Breakpoints

Bootstrap-Breakpoints werden übernommen und sind die einzigen erlaubten Breakpoints:

```
xs:  < 576px   → kleines Handy (Basis, kein Suffix)
sm:  ≥ 576px   → großes Handy / kleines Tablet
md:  ≥ 768px   → Tablet / großes Handy quer
lg:  ≥ 992px   → kleines Desktop
xl:  ≥ 1200px  → Desktop
```

### App-Shell: Mobile (< 768px)

Auf Mobile gibt es **keine Sidebar**. Die Navigation ist eine **Bottom Navigation Bar** – fest am unteren Bildschirmrand, wie bei nativen Apps.

```
┌─────────────────────────────────┐
│  Top Bar (fixed, 56px)          │
│  [≡]      SIMS        [+ NEU]   │
├─────────────────────────────────┤
│                                 │
│  Page Content                   │
│  (scrollable)                   │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Bottom Nav (fixed, 60px)       │
│  [Artikel][Kunden][Belege][···] │
└─────────────────────────────────┘
```

**Top Bar (Mobile):**
```css
position: fixed;
top: 0; left: 0; right: 0;
height: 56px;
background: var(--accent-primary);
color: white;
z-index: 100;
display: flex;
align-items: center;
justify-content: space-between;
padding: 0 1rem;
```

- Links: Hamburger-Icon öffnet Drawer für alle Unterseiten
- Mitte: "SIMS" in DM Mono, uppercase, letter-spacing 0.2em
- Rechts: Kontext-abhängige primäre Aktion (z. B. "+ Artikel")

**Bottom Navigation (Mobile):**
```css
position: fixed;
bottom: 0; left: 0; right: 0;
height: 60px;
background: white;
border-top: 1px solid var(--border);
z-index: 100;
display: flex;
align-items: center;
justify-content: space-around;
padding-bottom: env(safe-area-inset-bottom);
```

- Max. 4 Einträge: Artikel · Kunden · Belege · Mehr (öffnet Drawer)
- Aktiv: `color: var(--accent-highlight)`, kleiner Label darunter in DM Mono
- Inaktiv: `color: var(--ink-3)`
- Icon-Größe: 22px, Label: 10px DM Mono uppercase
- Tap-Target mindestens 44×44px pro Item

**Page Content (Mobile):**
```css
padding-top: 56px;    /* Top Bar Höhe */
padding-bottom: calc(60px + env(safe-area-inset-bottom));
padding-left: 1rem;
padding-right: 1rem;
```

### App-Shell: Desktop (≥ 768px)

Ab Tablet-Breite erscheint die klassische **Sidebar** links.

```
┌──────────────────────────────────────────────┐
│  Sidebar (240px, fixed)  │  Main Content      │
│                          │                    │
│  SIMS                    │  Page Header       │
│  ───────────────         │  ────────────────  │
│  Nav Links               │  Content           │
│                          │                    │
└──────────────────────────────────────────────┘
```

**Sidebar (Desktop):**
```css
width: 240px;
background: var(--accent-primary);
color: white;
position: fixed;
height: 100vh;
top: 0; left: 0;
z-index: 50;
```

- Logo oben: `DM Mono`, `uppercase`, `letter-spacing: 0.2em`, weiß
- Nav-Items: `Inter 400`, 0.875rem, weiß `opacity: 0.7` inaktiv
- Aktiv: `opacity: 1`, weißer linker Border (3px), `rgba(255,255,255,0.1)` Hintergrund
- Nav-Section-Labels: DM Mono, 0.6rem, uppercase, `opacity: 0.35`

**Main Content (Desktop):**
```css
margin-left: 240px;
padding: 2rem 2.5rem;
background: var(--bg-light);
min-height: 100vh;
```

### Page Header

**Mobile:** Nur der Seitentitel. Der CTA ist in der Top Bar rechts.  
**Desktop:** Seitentitel links, CTA-Button rechts, Eyebrow-Label darüber.

```
Desktop:
[Eyebrow (DM Mono, muted)]
[Page Title (DM Serif, 1.75rem)]    [Primary Action Button]
────────────────────────────────────────────────────────────
```

### Spacing-Skala

```css
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-12: 3rem;     /* 48px */
```

---

## 5. Komponenten

### Touch-Targets

**Alle interaktiven Elemente auf Mobile müssen mindestens 44×44px groß sein** (Apple HIG / WCAG 2.5.5):

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Buttons

Alle Buttons haben `border-radius: 999px` (Pill-Form). Auf Mobile sind primäre Buttons voller Breite.

```css
/* Primary */
.btn-sims-primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  min-height: 48px;
  width: 100%;
  transition: background 0.18s;
}
@media (min-width: 768px) {
  .btn-sims-primary { width: auto; padding: 0.55rem 1.25rem; font-size: 0.875rem; }
  .btn-sims-primary:hover { background: var(--accent-secondary); transform: translateY(-1px); }
}

/* Outline */
.btn-sims-outline {
  background: white;
  color: var(--ink-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.7rem 1.5rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  min-height: 48px;
  width: 100%;
}
@media (min-width: 768px) {
  .btn-sims-outline { width: auto; font-size: 0.875rem; padding: 0.55rem 1.25rem; }
}

/* Ghost / Danger */
.btn-sims-ghost  { background: none; border: none; color: var(--ink-2); min-height: 44px; border-radius: 999px; }
.btn-sims-danger { background: var(--status-error); color: white; border: none; border-radius: 999px; min-height: 48px; }

/* Icon-Button */
.btn-sims-icon {
  background: none;
  border: none;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-3);
  border-radius: 50%;
}
@media (hover: hover) {
  .btn-sims-icon:hover { background: var(--bg-subtle); color: var(--ink-2); }
}
```

### Cards

```css
.sims-card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  padding: 1.25rem;
}
@media (min-width: 768px) {
  .sims-card { border-radius: 1.5rem; padding: 1.5rem; }
}

.sims-card-table {
  border-radius: 1.25rem;
  overflow: hidden;
  padding: 0;
  background: white;
  border: 1px solid var(--border);
}
```

### Tabellen – Mobile Adaptation

Auf Mobile werden Tabellenzeilen als **gestapelte Cards** dargestellt.

**Strategie 1 – Card-List (Mobile-Standard, < 768px):**

```css
@media (max-width: 767px) {
  .table-responsive-cards thead { display: none; }
  .table-responsive-cards tbody tr {
    display: block;
    background: white;
    border: 1px solid var(--border);
    border-radius: 1rem;
    margin-bottom: 0.75rem;
    padding: 1rem;
  }
  .table-responsive-cards tbody td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0;
    border: none;
    font-size: 0.9375rem;
  }
  .table-responsive-cards tbody td::before {
    content: attr(data-label);
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-3);
    flex-shrink: 0;
    margin-right: 1rem;
  }
}
```

Jede `<td>` braucht ein `data-label`-Attribut:
```html
<td data-label="Artikel-Nr.">ART-00142</td>
<td data-label="Lagerstand">340</td>
```

Die gesamte Card-Zeile muss per Tap navigierbar sein (kein kleiner Detail-Button nötig).

**Strategie 2 – Horizontal Scroll** (für sehr schmale Tabellen):
```css
.table-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 1.25rem;
}
```

**Desktop (≥ 768px):** Normales Tabellenlayout.

```css
@media (min-width: 768px) {
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: var(--bg-subtle);
    color: var(--ink-3);
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }
  tbody tr { border-bottom: 1px solid var(--border-sub); }
  tbody tr:hover { background: var(--accent-light); }
  tbody td { padding: 0.75rem 1rem; color: var(--ink-2); font-size: 0.875rem; vertical-align: middle; }
  td.numeric { font-family: 'DM Mono', monospace; text-align: right; color: var(--ink); }
}
```

### Status-Badges

```css
.sims-badge {
  display: inline-flex;
  align-items: center;
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  white-space: nowrap;
}
.sims-badge-success { background: var(--status-success-light); color: var(--status-success); border: 1px solid var(--status-success-border); }
.sims-badge-warning { background: var(--status-warning-light); color: var(--status-warning); border: 1px solid var(--status-warning-border); }
.sims-badge-error   { background: var(--status-error-light);   color: var(--status-error);   border: 1px solid var(--status-error-border); }
.sims-badge-neutral { background: var(--status-neutral-light); color: var(--status-neutral); border: 1px solid var(--border); }
.sims-badge-accent  { background: var(--accent-muted);         color: var(--accent-primary); border: 1px solid var(--accent-light); }
```

### Formularelemente

Inputs auf Mobile haben `font-size: 1rem` – verhindert Auto-Zoom auf iOS.

```css
.sims-input,
.sims-select,
.sims-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;          /* PFLICHT: niemals < 16px auf Mobile */
  color: var(--ink);
  background: white;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-height: 48px;
  -webkit-appearance: none;
  appearance: none;
}
.sims-input:focus,
.sims-select:focus,
.sims-textarea:focus {
  outline: none;
  border-color: var(--accent-highlight);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.sims-input::placeholder { color: var(--ink-3); }

.sims-label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ink-2);
  margin-bottom: 0.4rem;
}
```

### Leere Zustände (Empty States)

```
[Zentriert, padding: 3rem 1.5rem]

[Icon, 32px, color: var(--ink-3)]
[Titel: DM Serif Display, 1.25rem]
[Beschreibung: Inter 300, 0.9rem, --ink-3]
[CTA: .btn-sims-primary (volle Breite Mobile, auto Desktop)]
```

### Modals / Dialogs

- **Desktop:** zentriertes Modal, `border-radius: 1.5rem`, `max-width: 32rem`
- **Mobile: Bottom Sheet** – gleitet von unten rein, `border-radius: 1.5rem 1.5rem 0 0`, volle Breite

```css
.sims-modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
}

.sims-modal {
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 32rem;
}

@media (max-width: 767px) {
  .sims-modal-backdrop { align-items: flex-end; }
  .sims-modal {
    border-radius: 1.5rem 1.5rem 0 0;
    max-width: 100%;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
    max-height: 90vh;
    overflow-y: auto;
  }
}
```

---

## 6. Angular-spezifische Konventionen

### CSS-Architektur

```
apps/sim-system/src/
├── styles/
│   ├── _variables.css    ← Alle CSS Custom Properties
│   ├── _reset.css        ← Minimaler Reset
│   ├── _typography.css   ← Type-Regeln (keine @font-face, kommen vom Backend)
│   ├── _components.css   ← sims-eigene Komponenten-Styles
│   ├── _layout.css       ← Top Bar, Bottom Nav, Sidebar, Main-Content
│   └── _mobile.css       ← Mobile-spezifische Overrides
└── styles.scss           ← Bootstrap-Grid + alle partials
```

**`styles.scss`:**
```scss
// Bootstrap – nur Grid und Utilities
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';
@import 'bootstrap/scss/grid';
@import 'bootstrap/scss/utilities';

// sims Design System
@import './styles/variables';
@import './styles/reset';
@import './styles/typography';
@import './styles/layout';
@import './styles/components';
@import './styles/mobile';
```

### Viewport Meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

`viewport-fit=cover` ist nötig für Safe-Area-Support auf iPhones mit Notch / Dynamic Island.

### Component-Styles

- `ViewEncapsulation.Emulated` (Standard) für alle Komponenten
- Keine Bootstrap-Komponenten-Klassen in Templates (kein `.btn`, `.card`, `.navbar` von Bootstrap)
- Keine hardcodierten Hex-Werte – ausschließlich `var(--token-name)`
- Keine Inline-Styles in Templates

---

## 7. Animationen

Auf Mobile sind Animationen kürzer – sie wirken dort sonst als Latenz.

```css
/* Route-Wechsel */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: fadeUp 0.18s ease forwards; }

/* Bottom Sheet */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.bottom-sheet-enter { animation: slideUp 0.22s ease forwards; }

/* Hover – nur auf Pointer-Geräten */
@media (hover: hover) {
  .sims-card:hover        { transform: translateY(-2px); transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .btn-sims-primary:hover { transform: translateY(-1px); transition: background 0.15s, transform 0.12s; }
}

/* Skeleton Loading */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--bg-subtle) 25%, var(--border) 50%, var(--bg-subtle) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s ease infinite;
  border-radius: 0.5rem;
}
```

### Verboten

- Scroll-basierte Parallax
- `animation-duration > 0.35s` für UI-Feedback
- Bounce- oder Elastic-Easing
- Hover-Effekte ohne `@media (hover: hover)` Guard
- Animationen auf Tabellenzellen oder reinem Text

---

## 8. Mobile UX-Regeln

### Allgemein
- Touch-Targets mindestens 44×44px für alle interaktiven Elemente
- Kein Hover-only-Feedback – alle Zustände brauchen eine Touch-Alternative
- Keine horizontalen Scrollbars auf Page-Ebene
- `@media (hover: hover)` für alle Hover-Effekte

### Formulare
- Inputs immer `font-size: 1rem` (mindestens 16px) – kein iOS Auto-Zoom
- `inputmode`-Attribut setzen: `inputmode="numeric"` für Mengen/Preise, `inputmode="decimal"` für Dezimalzahlen
- Formular-Submit-Buttons immer am Ende, volle Breite, mindestens 48px hoch
- `autocomplete`-Attribute setzen wo sinnvoll

### Navigation
- Bottom Navigation zeigt max. 4 Hauptbereiche
- Zurück-Navigation über Browser Back / iOS Swipe-Back
- Kein Hamburger-only: Bottom Nav ist immer sichtbar

### Listen
- Tabellenzeilen als Card-List (Strategie 1) auf Mobile
- Primäre Aktion per Tap auf die gesamte Card – kein kleiner Detail-Button nötig
- Sekundäre Aktionen in Kontext-Menü oder Swipe-Action

### Performance
- Lazy Loading für alle Routen (`loadChildren`)
- Icons als SVG, kein PNG für UI-Elemente
- `@supports (backdrop-filter: blur(1px))` vor `backdrop-filter`-Nutzung prüfen

---

## 9. Seiten-Übersicht

| Route | Seite | Mobile-Besonderheit |
|---|---|---|
| `/login` | Login | Vollbild, keine Navigation, CTA volle Breite |
| `/dashboard` | Dashboard | Stat-Cards einspaltig (Mobile), dreispaltig (Desktop) |
| `/articles` | Artikel | Card-List Mobile, Tabelle ab md |
| `/articles/:id` | Artikel-Detail | Formular einspaltig, Save-Button sticky bottom |
| `/customers` | Kunden | Card-List Mobile |
| `/customers/:id` | Kunden-Detail | Formular einspaltig |
| `/slipsheets` | Lieferscheine | Card-List, Status-Badge prominent |
| `/slipsheets/:id` | Lieferschein-Detail | Positionen als Card-List, Summe sticky bottom |
| `/bills` | Rechnungen | Card-List, Betrag prominent |
| `/bills/:id` | Rechnungs-Detail | PDF-Download als prominent platzierter CTA |
| `/cart` | Warenkorb / Bestellung | Step-by-Step, ein Schritt pro Screen auf Mobile |
| `/inventory` | Inventur | Primär-Mobile-Seite, Stepper-Eingabe, Barcode-Scan |
| `/inventory/:id` | Inventur-Session | Artikel-für-Artikel zählen, Fortschrittsanzeige |
| `/order/new` | Neue Bestellung | Mobile-optimierter Bestellerfassungs-Flow |

---

## 10. Mobile-Primärseiten

Diese zwei Seiten sind **Mobile-First im absoluten Sinne** – sie werden fast ausschließlich auf dem Handy verwendet und haben kein gleichwertiges Desktop-Pendant. Das Desktop-Layout ist eine vereinfachte Anpassung, nicht der Hauptfall.

---

### 10.1 Inventur (`/inventory`)

Die Inventur-Seite folgt einem **Scan-and-Count-Loop**: ein Artikel nach dem anderen. Kein Listenaufruf, keine Session mit allen Artikeln – der Nutzer scannt den Barcode, sieht die Artikelinfos, trägt den Ist-Bestand ein und bucht. Dann kommt der nächste Artikel.

Das entspricht dem realen Lagerablauf: Handy in der Hand, Barcode-Scanner oder Kamera, Artikel für Artikel durch das Regal.

#### Struktur

```
Top Bar (fixed)
  [≡]    INVENTUR    [ ]

Scan-Bereich (white card, border-bottom)
  [Label: BARCODE SCANNEN ODER EINGEBEN]
  [Barcode-Input (Pill, focus-blue)]  [Kamera-Button (14px, accent-primary)]

Artikel-Info-Card  ← erscheint nach Scan/Eingabe
  [● Artikelname]
  [Artikel-Nr · Typ-Badge]
  ─────────────────────
  Lagerstand  |  2.400 Blatt
  Hersteller  |  Steinbeis
  Barcode     |  9002224100062
  Beschreibung|  …

Soll / Ist Card
  [SOLL: 2.400 Bl]  |  [IST: − 2380 + Bl]
  ─────────────────────────────────────────
  [Differenz-Banner: − 20 Blatt]

[Inventur buchen – primary, 54px]

Section: "Zuletzt gebucht"
  [Log-Einträge mit Diff-Badge]

Bottom Navigation
```

#### Barcode-Eingabefeld

Das Eingabefeld hat beim Öffnen der Seite sofort `autofocus` – Scannen ohne Tap. Die blaue Focus-Border und der Glow zeigen den aktiven Zustand dauerhaft:

```css
.scan-input-wrap {
  flex: 1;
  display: flex; align-items: center; gap: 10px;
  background: var(--bg-light);
  border: 1.5px solid var(--accent-highlight);
  border-radius: 14px;
  padding: 0 14px; height: 54px;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
/* Input darin: DM Mono, 1.05rem, letter-spacing: 0.04em */
```

Der Kamera-Button rechts öffnet die Gerätekamera für QR/Barcode-Scan:

```css
.scan-camera-btn {
  width: 54px; height: 54px;
  background: var(--accent-primary);
  border: none; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: white; flex-shrink: 0;
}
```

Nach einem Scan oder Enter im Textfeld: `GET /articles?code=<barcode>` → Artikel-Info-Card erscheint, Ist-Feld erhält Fokus.

#### Artikel-Info-Card

Zeigt alle relevanten Felder aus dem alten Template als kompakte Tabelle:

```css
.article-info-table th {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--ink-3);
  padding: 7px 14px; white-space: nowrap;
  width: 1%; /* fit-content */
}
.article-info-table td {
  font-size: 0.875rem; color: var(--ink-2);
  padding: 7px 14px 7px 0;
}
```

Felder: **Lagerstand** (DM Mono, prominent), Hersteller, Barcode (DM Mono), Beschreibung.  
Name und Artikel-Nr. stehen im Card-Header, nicht in der Tabelle.

#### Soll / Ist Card

Die zwei Werte stehen nebeneinander in einer geteilten Card – visuell sofort vergleichbar:

```css
.count-card { border-radius: 16px; overflow: hidden; }

.count-half {
  flex: 1; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 4px;
}
.count-half:first-child { border-right: 1px solid var(--border); }

/* Soll: read-only, muted */
/* Ist: editierbar – DM Mono 1.4rem, accent-primary */
```

**Ist-Eingabe:** Stepper (− / +) für kleine Anpassungen, direktes Tippen auf den Wert öffnet das nummerische Keyboard (`inputmode="numeric"`). Kein separates Soll-Input-Feld – Soll ist immer read-only und kommt vom Backend.

#### Differenz-Banner

Erscheint unterhalb der Soll/Ist-Card, sobald ein Ist-Wert eingegeben wurde:

```css
.diff-banner {
  border-top: 1px solid var(--border);
  padding: 8px 14px;
  display: flex; align-items: center; justify-content: space-between;
}
/* Farben je Zustand: */
.diff-banner.negative { background: var(--status-error-light); }
.diff-banner.positive { background: var(--status-warning-light); }
.diff-banner.zero     { background: var(--status-success-light); }
```

Wert in DM Mono, 1rem, mit Vorzeichen: `− 20 Blatt` / `+7 Blatt` / `±0`.

#### "Inventur buchen"-Button

```css
/* Deaktiviert wenn kein Artikel geladen */
.inv-submit:disabled { opacity: 0.35; pointer-events: none; }
```

Nach erfolgreichem POST: Barcode-Feld leert sich, Artikel-Info-Card und Soll/Ist-Card verschwinden, Log-Eintrag erscheint oben in der "Zuletzt gebucht"-Liste, Barcode-Feld erhält wieder Fokus für den nächsten Scan.

#### "Zuletzt gebucht"-Log

Kompakte Zeilen mit Checkmark, Artikelname, Ist-Menge und Diff-Badge:

```css
.log-item {
  border-radius: 12px; padding: 10px 14px;
  display: flex; align-items: center; gap: 10px;
}
.log-diff.ok  { color: var(--status-success); font-family: 'DM Mono', monospace; }
.log-diff.neg { color: var(--status-error);   font-family: 'DM Mono', monospace; }
.log-diff.pos { color: var(--status-warning); font-family: 'DM Mono', monospace; }
```

Max. 5 Einträge sichtbar (älteste fallen heraus). Der Log dient als visueller Kontext – "was habe ich in dieser Session schon gemacht".

#### Angular-Implementierungshinweise

```typescript
// Component-Struktur
export class InventoryComponent {
  code = '';        // Barcode-Input, autofocus
  Article: ArticleEntity | null = null;
  shouldVal = 0;    // read-only vom Backend
  isVal = 0;        // Eingabe
  recentLog: LogEntry[] = [];

  onCodeChange() {
    // GET /articles?code=this.code
    // → this.Article setzen, this.shouldVal = Article.stock
    // → isVal auf shouldVal vorbelegen (häufigster Fall: kein Fehler)
  }

  onSubmit() {
    // POST /articles/:id/inventory { is: this.isVal, inventoryDate: today }
    // → Log-Eintrag prependen
    // → Felder zurücksetzen, Fokus auf code-Input
  }
}
```

**Wichtig:** `isVal` wird beim Laden eines Artikels auf `shouldVal` vorbelegt. Das spart Tipparbeit wenn der Bestand stimmt – der Nutzer muss nur korrigieren, nicht neu eingeben.

---

### 10.2 Neue Bestellung (`/order/new`)

Ermöglicht die schnelle Bestellaufnahme beim Kunden oder im Lager direkt vom Handy. Ersetzt den Desktop-`/cart`-Flow durch eine mobile-optimierte Variante.

#### Struktur

```
Top Bar (fixed)
  ← [zurück]    NEUE BESTELLUNG / "Entwurf · N Positionen"    [Verwerfen]

Kunden-Strip (sticky unter Top Bar)
  [Avatar-Initialen]  [Kundenname]  [Kundennummer]    [Ändern →]

Section: "Positionen"
  [Bestell-Position] × N
  [+ Artikel oder Textposition hinzufügen] (gestrichelter Button)

[Notiz-Card]

[Zusammenfassung: Netto / MwSt / Gesamt]

Bottom Action Area (fixed bottom)
  [Lieferschein erstellen – primary, 52px]
  [Als Entwurf speichern – ghost]
```

#### Bestell-Position

Zwei Typen, beide als Card mit gleichem Layout:

**Artikel-Position:**
```
Oberer Bereich:
  [Artikelname]          [Preis / Einheit]
  [Artikel-Nr DM Mono]

Unterer Bereich (bg-subtle):
  [Löschen-Icon]    [− Menge +]  [Einheit]    [Zeilensumme]
```

**Textposition** (für Pauschalleistungen, Porto etc.):
```
Oberer Bereich:
  [Freitext]            [Preis]
  [Badge: TEXTPOSITION]

Unterer Bereich:
  [Löschen-Icon]    [1× Pauschal]    [Preis]
```

```css
/* Artikel hinzufügen – gestrichelter Button */
.add-position-btn {
  width: 100%;
  background: var(--accent-light);
  color: var(--accent-primary);
  border: 1.5px dashed var(--accent-muted);
  border-radius: 14px;
  height: 48px;
  display: flex; align-items: center; justify-content: center;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem; font-weight: 500;
  cursor: pointer;
}
```

Tap auf diesen Button öffnet ein **Bottom Sheet** mit:
- Suchfeld (Autofokus, `inputmode="search"`)
- Letzte/häufige Artikel (max. 5, aus localStorage)
- Toggle: "Artikel" / "Textposition"

#### Kunden-Strip

```css
.customer-strip {
  background: white;
  border-bottom: 1px solid var(--border);
  padding: 12px 16px;
  display: flex; align-items: center; gap: 10px;
  position: sticky;
  top: 56px;   /* unter Top Bar */
  z-index: 10;
}

.customer-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent-muted);
  color: var(--accent-primary);
  display: flex; align-items: center; justify-content: center;
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem; font-weight: 500;
  flex-shrink: 0;
}
```

Ist noch kein Kunde gewählt, zeigt der Strip einen `[Kunden wählen →]`-Button in accent-highlight.

#### Zusammenfassung

Zeigt Netto, MwSt und Gesamtbetrag. Werte werden live beim Ändern von Mengen aktualisiert.

```css
.order-summary {
  background: white;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 14px;
  margin: 16px 16px 0;
}
```

#### Bottom Action Area

```css
.bottom-action-area {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid var(--border);
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  display: flex; flex-direction: column; gap: 8px;
}
```

- **Primär:** "Lieferschein erstellen" – `btn-sims-primary`, volle Breite, 52px Höhe
- **Sekundär:** "Als Entwurf speichern" – `btn-sims-ghost`, 36px, zentriert
- Ist die Bestellung noch unvollständig (kein Kunde, keine Positionen), ist der primäre Button deaktiviert mit `opacity: 0.4; pointer-events: none`

#### Entwurf-Verwaltung

- Beim Verlassen der Seite (Back-Button, "Verwerfen") erscheint ein **Bottom Sheet** als Bestätigung: "Entwurf speichern" / "Verwerfen"
- Entwürfe sind auf dem Dashboard als "Offene Entwürfe"-Badge sichtbar
- Max. 5 Entwürfe gleichzeitig (älteste wird automatisch gelöscht)

#### Besonderheiten

- Menge kann via Stepper oder Direkteingabe (Tap auf Wert → nummerisches Input-Field) geändert werden
- Preise werden vom Backend geladen (`GET /articles/:id` beim Hinzufügen) und lokal gecacht
- Gesamtberechnung erfolgt im Frontend (keine Round-Trip-Abhängigkeit)
- `inputmode="decimal"` für Preisfelder bei Textpositionen

---

## 11. Was aktiv vermieden wird

- ❌ Fonts von Google Fonts oder externen Diensten – ausschließlich vom eigenen Backend (`/api/fonts/`)
- ❌ Bootstrap-Komponenten-Klassen in Templates (kein `.btn`, `.card`, `.navbar` von Bootstrap)
- ❌ Eckige Buttons – immer `border-radius: 999px`
- ❌ Reines Schwarz (`#000`) – immer `var(--ink)`
- ❌ Hardcodierte Hex-Werte in Templates oder Component-CSS
- ❌ Lila/violette Gradienten
- ❌ Mehr als zwei gleichzeitig sichtbare Akzentfarben
- ❌ `animation-duration > 0.35s` für UI-Feedback
- ❌ Hover-Effekte ohne `@media (hover: hover)` Guard
- ❌ Font-Size unter 16px auf Input-Elementen
- ❌ Touch-Targets unter 44×44px
- ❌ Sidebar auf Mobile – Bottom Navigation ist der Standard
- ❌ Inline-Styles in Angular-Templates
- ❌ `!important` außer in zwingenden Reset-Fällen

---

*Stand: 2026 · Simon Abler · sims.abler.tirol*