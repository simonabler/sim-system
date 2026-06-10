# klara.abler.tirol — Dokumentationstool für Lehrkräfte

## Charakter
Ruhig, warm, menschlich. Betont Vertrauen und Datenschutz.
Helles Layout, viel Weißraum, Serif-Titel (kursiv).
Wenig technischer Jargon — spricht Lehrkräfte an, nicht Developer.

## Akzentfarben
```css
--accent-primary:   #064e3b;   /* Emerald 900 */
--accent-secondary: #065f46;   /* Emerald 800 */
--accent-highlight: #10b981;   /* Emerald 500 — aktive Elemente, Icons */
--accent-light:     #ecfdf5;   /* Emerald 50 — subtile Hintergründe */
```

## Produkttyp: Fullstack (eigenständig)
- **Eigenes NestJS Backend** + PostgreSQL/SQLite
- **Eigene Authentifizierung** (Google OAuth + JWT)
- Kein Zugriff auf `api.abler.tirol` — vollständig unabhängig
- Self-Hosted: Nutzer betreiben eigene Instanz
- Fonts: `api.abler.tirol/fonts/abler-stack.css`

## Hero-Stil
Sehr hell, viel Weißraum. `DM Serif Display` italic dominant im Titel
("Dokumentation, die *endlich* mitdenkt.").
Kein Dark Hero, kein Terminal-Widget.

## Typografie-Gewicht
Serif-dominant. `DM Serif Display` italic für Haupttitel.
`Inter` light (300) für Fließtext — ruhig, lesbar.
`DM Mono` nur für technische Labels (DSGVO-Badges, Status).

## DSGVO / Datenschutz
Klara ist DSGVO-konform by design — das ist ein Kernelement des Brandings:
- "Self-hosted" Badge prominent
- "Keine Daten bei Drittanbietern"
- "Open Source — jede Zeile Code öffentlich"
Datenschutz-Section ist Pflichtbestandteil jeder Seite.

## UI-Besonderheiten
- App-Interface: Angular, Bootstrap 5
- Schülerprofile, Notizen, Leistungen als separate Bereiche
- Keine komplexen Mega-Menüs — Reduktion ist Kernwert
- Testimonials von Lehrkräften auf der Landing Page
- CTA: "Klara jetzt ausprobieren →" + "Selbst hosten"

## Repo
`github.com/simonabler/Klara`
