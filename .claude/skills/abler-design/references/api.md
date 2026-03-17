# api.abler.tirol — Zentrale REST-API

## Charakter
Technisch, präzise, terminal-nah. `DM Mono` dominiert sichtbarer als
bei anderen Produkten. Dark Hero mit Terminal-Widget. Developer-First.

## Akzentfarben
```css
--accent-primary:   #0f172a;   /* Slate 900 */
--accent-secondary: #1e3a5f;   /* Deep Blue-Slate */
--accent-highlight: #5bffc3;   /* Terminal Green — Cursor, Live-Indikatoren */
--accent-code:      #3b8fff;   /* Code Blue — Syntax-Highlighting */
--bg-dark:          #0b0d11;   /* Hero / Terminal backgrounds */
```

## Produkttyp: API + Minimal-Frontend
- NestJS Backend (Port 3000)
- Angular Frontend (Port 80)
- Eigene Datenbank (SQLite / PostgreSQL)
- CORS: `*` — öffentlich nutzbar
- Fonts werden hier **gehostet** und an alle anderen Subdomains ausgeliefert

## Font-Server Endpunkte
```
GET /fonts/abler-stack.css        → kombiniertes @font-face CSS
GET /fonts/files/:filename        → individuelle woff2-Dateien
```
Font-Dateien liegen in `apps/server/src/assets/fonts/files/` (woff2 aus `@fontsource`).
NestJS GlobalPrefix ist `api` — `/fonts/*` ist davon **ausgenommen** (`exclude: ['fonts/(.*)']`).

## Hero-Stil
Dark Hero (`--bg-dark`) mit Grid-Overlay, Glow-Effekten und Terminal-Widget.
Terminal zeigt Live-Curl-Beispiele mit animiertem Cursor (`blink 1.1s step-end`).

## Typografie-Gewicht
Mono-lastig. `DM Mono` für Labels, Badges, Terminal, alle technischen Texte.
`DM Serif Display` wird hier nicht oder sehr sparsam eingesetzt.

## Swagger / API Docs
Swagger UI unter `/api` — beide Domains als Server eingetragen:
```ts
.addServer('https://api.abler.tirol')
.addServer('https://hub.abler.tirol')  // Legacy, bleibt aktiv
```

## Traefik — beide Domains, getrennte Router
```yaml
# Frontend: hub + api → selber Service, 2 Router für 2 Zertifikate
hub-frontend:  Host(`hub.abler.tirol`) && PathPrefix(`/`)
api-frontend:  Host(`api.abler.tirol`) && PathPrefix(`/`)
# Backend: /api/* und /fonts/* → NestJS
hub-backend:   Host(`hub.abler.tirol`) && (PathPrefix(`/api`) || PathPrefix(`/fonts`))
api-backend:   Host(`api.abler.tirol`) && (PathPrefix(`/api`) || PathPrefix(`/fonts`))
```

## Repo
`github.com/simonabler/simonapi` (NX Monorepo: `apps/server` + `apps/simonapi`)

## API-Endpunkte (Übersicht)
`/api/qr` · `/api/barcode` · `/api/barcode/gs1` · `/api/crypto`
`/api/watermark` · `/api/signpacks` · `/api/utils` · `/api/locks`
`/fonts/abler-stack.css` · `/fonts/files/:filename`

## Besonderheiten beim Entwickeln
- Neue Endpunkte: eigenes NestJS Module in `apps/server/src/app/<name>/`
- Font-Assets: woff2 aus `@fontsource` in `apps/server/src/assets/fonts/files/`
- Webpack kopiert `src/assets/` automatisch nach `dist/`
- API-Keys: 3 Tiers — Free (10/min), Pro (`sk_pro_`), Industrial (`sk_ind_`)
