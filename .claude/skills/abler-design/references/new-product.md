# Neue Subdomain / Neues Produkt — Checkliste

Wenn ein neues Produkt unter `*.abler.tirol` erstellt wird,
folge dieser Checkliste. Danach ergänze eine neue Referenzdatei
in `references/<n>.md` nach dem Muster der bestehenden.

---

## 1. Produkt-Typ festlegen

| Typ | Wann | Beispiel |
|---|---|---|
| **Pure Frontend** | Kein eigenes Backend nötig, alle Daten von api.abler.tirol | barcode, pdf |
| **Fullstack** | Eigene DB, eigene Auth, unabhängig | klara, sims |
| **Landing** | Nur statische Seite | abler.tirol |
| **API + Minimal-Frontend** | Backend ist das Produkt | api |

## 2. Akzentfarbe wählen

Bestehende Farben (nicht nochmal verwenden):
- Slate / Blue-Slate → api
- Emerald → klara
- Amber → barcode
- Indigo → pdf
- Teal → sims
- Nacht-Dunkel → daedalus

Empfohlene freie Paletten für neue Produkte:
- Rose / Pink → warme Consumer-Tools
- Sky / Cyan → Kommunikation, Echtzeit
- Orange → Warnung, Monitoring
- Violet (helles) → Kreativ-Tools
- Stone / Warm-Gray → Neutrales, Dokumentation

Immer: dunkle `from`-Farbe (900) + etwas hellere `to`-Farbe (800) für Gradient.

## 3. CSS-Variablen anlegen

```css
--<n>-from: <900-shade>;
--<n>-to:   <800-shade>;
--<n>-highlight: <500-shade>;
--<n>-light:     <50-shade>;
```

## 4. Dateien erstellen

### Pure Frontend (Static)
```
<n>-abler-tirol/
├── index.html
├── nginx.conf
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Fullstack
```
<n>-abler-tirol/  (oder eigener Repo-Name)
├── apps/
│   ├── server/   (NestJS)
│   └── frontend/ (Angular o.ä.)
├── docker-compose.yml
├── dockerfiles/
└── README.md
```

## 5. Font-Einbindung

```html
<link rel="preconnect" href="https://api.abler.tirol" />
<link rel="stylesheet" href="https://api.abler.tirol/fonts/abler-stack.css" />
```

## 6. Traefik-Labels (docker-compose.yml)

Eigener Router pro Domain — nie mehrere Domains in einem Router:
```yaml
- "traefik.http.routers.<n>-frontend.rule=Host(`<n>.abler.tirol`) && PathPrefix(`/`)"
- "traefik.http.routers.<n>-frontend.tls=true"
- "traefik.http.routers.<n>-frontend.tls.certresolver=letsEncrypt"
- "traefik.http.routers.<n>-frontend.entrypoints=websecure"
- "traefik.http.routers.<n>-frontend.service=<n>-svc"
- "traefik.http.services.<n>-svc.loadbalancer.server.port=80"
```

## 7. abler.tirol Landing Page aktualisieren

In `github.com/simonabler/abler-tirol/index.html`:
1. CSS-Variable `--<n>-from` / `--<n>-to` in `:root`
2. `.card-top-<n>` Gradient-Klasse
3. Neue Card im `products-grid` (bei 5. und folgenden: `card-wide`)
4. Widget-Zähler erhöhen
5. Widget-Row ergänzen

## 8. DESIGN_PRINCIPLES.md aktualisieren

- Neue Zeile in der Produktcharakter-Tabelle (Abschnitt 9)
- Neue Akzentfarbe in Abschnitt 4
- Neuer Repo-Eintrag in Abschnitt 11

## 9. Diese Skill-Datei ergänzen

Neue Datei `references/<n>.md` nach dem Muster der bestehenden anlegen:
- Charakter & Zielgruppe
- Akzentfarben (CSS)
- Produkttyp & Tech-Stack
- Hero-Stil
- Typografie-Gewicht
- UI-Besonderheiten
- Repo-Link
