# sims.abler.tirol — Lagerverwaltungssystem

## Charakter
Direkt, funktional, industriell-nah. Für Lager, Werkstätten, kleine Betriebe.
Das UI darf nicht vom UX ablenken — Daten und Aktionen stehen im Vordergrund,
nicht das Interface selbst. Teal als ruhiger, industrieller Gegenpol zu Emerald (klara).

## Akzentfarben
```css
--accent-primary:   #134e4a;   /* Teal 900 */
--accent-secondary: #0f3d3a;   /* Teal 950 */
--accent-highlight: #14b8a6;   /* Teal 500 — aktive Elemente */
--accent-light:     #f0fdfa;   /* Teal 50 — Hover-Hintergrund, subtile Fills */
```

## Status-Farben (sims-spezifisch)
```css
--status-ok:        #14b8a6;   /* Teal — In Bestand */
--status-low:       #f59e0b;   /* Amber — Niedrig */
--status-empty:     #ef4444;   /* Rot — Leer */
--status-ok-bg:     #f0fdfa;
--status-low-bg:    #fffbeb;
--status-empty-bg:  #fef2f2;
```

## Radius-Regeln (sims)
sims verwendet **reduzierte Radien** — funktional, nicht dekorativ:
```css
--radius-pill: 999px;   /* Buttons, Badges — abler-Ökosystem-Pflicht */
--radius-md:   6px;     /* Cards, Inputs, Tabellen, Panels */
--radius-sm:   4px;     /* Tags, kleine Elemente */
--radius-xs:   3px;     /* Code, inline */
```
Kein `--radius-xl` (2rem) oder `--radius-lg` (1.5rem) auf funktionalen Elementen.

## Produkttyp: Fullstack (eigenständig)
- **Eigenes Backend** (NestJS)
- **Eigene Datenbank** — Artikel, Bestände, Bewegungen persistent
- Kein Zugriff auf `api.abler.tirol`
- Self-Hosted
- Fonts: `api.abler.tirol/fonts/abler-stack.css`
- Design Guid: design-guide.html
## Hero-Stil
Hell (`--bg-light`), Teal-Akzente. Funktional-first.
Kein ausladender Marketing-Hero — direkt zur App oder zum Einstieg.

## Typografie-Gewicht
`Inter`-dominant. `DM Serif Display` nur sparsam (Seitenüberschriften).
`DM Mono` für alle technischen Werte: Artikelnummern, Mengenangaben, Beträge, Status-Labels.

## UI-Besonderheiten

### Navigation (Sidebar im App-Kontext)
- Hintergrund: `--accent-secondary` (#0f3d3a)
- Aktiver Eintrag: `background: rgba(20,184,166,0.15)`, `color: --accent-highlight`
- Sektions-Labels: `DM Mono`, `uppercase`, `rgba(255,255,255,0.2)`
- Sidebar-Items: `border-radius: var(--radius-sm)` (4px)

### Tabellen
- Responsive: `overflow-x: auto` — Spalten werden **nie** versteckt
- Header: `DM Mono`, `uppercase`, `letter-spacing: 0.1em`, `--ink-3`
- Zeilenhover: `background: var(--accent-light)`
- Artikelnummern, Mengen, Beträge: immer `DM Mono`
- Wrapper: `border-radius: var(--radius-md)` (6px)

### Cards
- `border-radius: var(--radius-md)` (6px) — kein 2rem
- Hover: nur `box-shadow: var(--shadow-card)` — **kein** `translateY`
- Kontext-Signal via `border-left: 3px solid` (Teal / Amber / Rot)
- Kein dekorativer Gradient-Top

### Buttons
- Pill-Form (`border-radius: 999px`) — Ökosystem-Pflicht
- Hover: nur Farbwechsel — **kein** `translateY(-1px)`
- Kompaktes Padding: `0.55rem 1.25rem`
- Focus: `box-shadow: var(--shadow-focus)`, `outline: none`

### Status-Badges
```
Teal  → "In Bestand"  → badge-ok
Amber → "Niedrig"     → badge-low
Rot   → "Leer"        → badge-empty
```
- Font: `DM Mono`, `font-size: 0.7rem`
- Dot-Indikator (`::before`) für schnelle Lesbarkeit in Tabellen

### Formulare
- `border-radius: 6px` auf Inputs/Selects
- Labels: `DM Mono`, `uppercase`, `letter-spacing: 0.1em`, `--ink-3`
- Artikelnummer- und Mengen-Inputs: `font-family: var(--mono)`
- Schnellsuche prominent platzieren (Artikel-Nr. + Bezeichnung)

### Animationen
- Hover: **kein** `translateY` — nur Shadow/Farbwechsel
- Page Load: `fadeUp` mit `0.4s ease`, Stagger `0.07s`
- Focus: Teal-Ring via `box-shadow: var(--shadow-focus)`

## Dokument-Layout (Lieferschein / Rechnung)
- Header: `--accent-secondary` Hintergrund, Dokumenttyp in `DM Serif Display`
- Dokumentnummer: `DM Mono`, `--accent-highlight`
- Positionstabelle: Standard-Tabellen-Regeln (siehe oben)
- Footer: Gesamtbetrag in `DM Mono`, bündig rechts

## DSGVO
Self-Hosted = keine Fremddaten. Datenschutz-Hinweis knapp —
die Zielgruppe (Lager, Werkstatt) erwartet das als Standard.

## Zweisprachigkeit
- App-Kern (Dashboard, Tabellen, Formulare): **nur DE**
- Öffentliche Landing-Page: DE/EN mit Toggle

## Repo
`github.com/simonabler/sim-system`