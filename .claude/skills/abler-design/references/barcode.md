# barcode.abler.tirol — Barcode & QR Generator

## Charakter
Industriell, präzise, physisch-nah. Erinnert an Etiketten, Scanner,
Lagerlogistik. Helles Layout mit Amber-Akzenten.
Primäre Zielgruppe: Logistik, Handel, Produktion — keine Developer.

## Akzentfarben
```css
--accent-primary:   #78350f;   /* Amber 900 */
--accent-secondary: #92400e;   /* Amber 800 */
--accent-highlight: #f59e0b;   /* Amber 500 — aktive Zustände, Scan-Indikator */
--accent-light:     #fef3c7;   /* Amber 100 — subtile Hintergründe */
```

## Produkttyp: Pure Frontend
- Reines HTML/CSS/JS oder Angular SPA
- **Kein eigenes Backend** — alle Daten via `fetch()` von `api.abler.tirol`
- Docker: `nginx:alpine`
- Fonts: `api.abler.tirol/fonts/abler-stack.css`

## API-Aufrufe (Beispiele)
```js
// QR Code generieren
const res = await fetch('https://api.abler.tirol/api/qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'url', payload: { url: input }, format: 'svg' })
});

// Standard Barcode
const url = `https://api.abler.tirol/api/barcode/svg?type=code128&text=${encodeURIComponent(input)}&includetext=true`;

// GS1 (benötigt API-Key für Pro-Endpunkte)
const res = await fetch('https://api.abler.tirol/api/barcode/gs1/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': key },
  body: JSON.stringify({ symbology: 'gs1-128', format: 'png', items: [...] })
});
```

## Hero-Stil
Hell (`--bg-light`), Amber-Akzente. Generator-UI im Vordergrund —
kein langer Marketing-Text, direkt zum Tool.

## Typografie-Gewicht
`DM Serif Display` + `Inter`. Kein Terminal-Look.
Eyebrows und Tags in `DM Mono`.

## UI-Besonderheiten
- Generator steht sofort im Viewport — kein Scroll nötig
- Live-Preview des Barcodes während der Eingabe (debounced, ~300ms)
- Download-Button für PNG/SVG direkt neben der Vorschau
- Amber-Akzent als Scan-Linie / aktiver Rahmen bei der Preview
- Typ-Auswahl: QR / Code128 / EAN / GS1 als Pill-Tabs

## Repo
`github.com/simonabler/barcode-abler-tirol`
