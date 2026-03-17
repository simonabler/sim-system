# sims.abler.tirol — Lagerverwaltungssystem

## Charakter
Direkt, funktional, industriell-nah. Für Lager, Werkstätten,
kleine Betriebe. Kein Schnickschnack — das Tool soll im Arbeitsalltag
funktionieren. Teal als ruhiger, industrieller Gegenpol zu Emerald (klara).

## Akzentfarben
```css
--accent-primary:   #134e4a;   /* Teal 900 */
--accent-secondary: #0f3d3a;   /* Teal 950 */
--accent-highlight: #14b8a6;   /* Teal 500 — aktive Elemente */
--accent-light:     #f0fdfa;   /* Teal 50 — subtile Hintergründe */
```

## Produkttyp: Fullstack (eigenständig)
- **Eigenes Backend** (NestJS oder ähnlich)
- **Eigene Datenbank** — Artikel, Bestände, Bewegungen persistent
- Kein Zugriff auf `api.abler.tirol`
- Self-Hosted
- Fonts: `api.abler.tirol/fonts/abler-stack.css`

## Hero-Stil
Hell (`--bg-light`), Teal-Akzente. Funktional-first.
Kein ausladender Marketing-Hero — direkt zur App oder zum Einstieg.

## Typografie-Gewicht
`Inter`-dominant. `DM Serif Display` nur sparsam.
`DM Mono` für Artikelnummern, Mengenangaben, Status-Badges.

## UI-Besonderheiten
- Artikel / Lager / Bewegungen als klare Navigation
- Teal als aktiver Zustand bei Tabellen-Zeilen
- Schnellsuche prominent (Artikel-Nr., Bezeichnung)
- Status-Badges: `DM Mono`, Teal für "in Bestand", Amber für "niedrig", Rot für "leer"
- Responsive Tabellen — auf Mobile scrollbar, nicht versteckt
- Export-Funktion (CSV) als sekundäre Aktion

## DSGVO
Self-Hosted = keine Fremddaten. Datenschutz-Hinweis ähnlich wie klara,
aber knapper — die Zielgruppe erwartet das als Standard.

## Repo
`github.com/simonabler/sim-system`
