# pdf.abler.tirol — PDF Werkzeugkasten

## Charakter
Professionell, büro-nah, vertrauenswürdig. Für Notare, Verwaltung,
Büros, Lehrkräfte. Ruhiger als api, formaler als klara.
Primäre Zielgruppe: Büro, Verwaltung, alle die PDFs verwalten müssen.

## Akzentfarben
```css
--accent-primary:   #1e1b4b;   /* Indigo 950 */
--accent-secondary: #312e81;   /* Indigo 900 */
--accent-highlight: #6366f1;   /* Indigo 500 — aktive Elemente */
--accent-light:     #eef2ff;   /* Indigo 50 — subtile Hintergründe */
```

## Produkttyp: Pure Frontend
- Reines HTML/CSS/JS oder Angular SPA
- **Kein eigenes Backend** — alle Operationen via `api.abler.tirol`
- Datei-Uploads gehen direkt an die API (multipart/form-data)
- Docker: `nginx:alpine`
- Fonts: `api.abler.tirol/fonts/abler-stack.css`

## API-Aufrufe (Beispiele)
```js
// PDF signieren (Signpack-Workflow)
// 1. Upload
const form = new FormData();
form.append('file', file);
form.append('expiresInMinutes', '60');
const { id, token } = await fetch('https://api.abler.tirol/api/signpacks', {
  method: 'POST', body: form
}).then(r => r.json());

// 2. Signing-Link teilen: api.abler.tirol/api/signpacks/:id/meta?token=:token
// 3. Bundle herunterladen
const bundle = await fetch(`https://api.abler.tirol/api/signpacks/${id}/bundle.zip?token=${token}`);
```

## Hero-Stil
Hell (`--bg-light`), Indigo-Akzente. Tool-First — Upload-Bereich
prominent im Hero. Kein langer Intro-Text.

## Typografie-Gewicht
`Inter`-dominant, sans-lastig. Formaler, weniger verspielt.
`DM Serif Display` nur sparsam für H1.

## UI-Besonderheiten
- Drag & Drop Upload-Zone prominent (Indigo-Border on hover)
- Drei klar getrennte Tools: Sign / Merge / Split — Pill-Tab Navigation
- Kein Account nötig, keine Daten gespeichert (Signpack: temp. Token)
- Datenschutz-Hinweis prominent: "Kein Upload zu Drittanbietern"
- Indigo als aktiver Zustand bei Steps / Progress-Indikatoren

## Repo
`github.com/simonabler/pdf-abler-tirol`
