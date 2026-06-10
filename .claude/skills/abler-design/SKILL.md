---
name: abler-design
description: >
  Design- und Entwicklungs-Skill für das abler.tirol Ökosystem.
  Verwende diesen Skill immer wenn du für Simon Abler eine neue Seite,
  Komponente, Frontend, Landing Page oder UI-Element unter einer der
  abler.tirol Subdomains erstellst oder bearbeitest — also für
  abler.tirol, api.abler.tirol, barcode.abler.tirol, pdf.abler.tirol,
  klara.abler.tirol, sims.abler.tirol oder jede neue *.abler.tirol Domain.
  Auch beim Erstellen neuer Subdomains, beim Anpassen von Docker/nginx-Configs,
  beim Schreiben von READMEs für abler.tirol Repos, oder wenn das Gespräch
  Designentscheidungen für dieses Ökosystem betrifft. Trigger auch bei
  Fragen wie "wie soll X bei abler.tirol aussehen" oder "erstelle mir
  eine Seite im abler-Stil".
---

# abler.tirol — Design & Development Skill

Dieses Skill definiert das vollständige Design-System und die Entwicklungsregeln
für das `abler.tirol` Ökosystem. Es gilt für alle bestehenden und neuen Produkte.

---

## Schritt 1: Subdomain identifizieren

Bevor du anfängst, stelle fest für welche Subdomain du arbeitest.
Lies dann die entsprechende Referenzdatei:

| Subdomain | Referenzdatei | Produkt-Typ |
|---|---|---|
| `abler.tirol` | `references/abler-tirol.md` | Landing / Static |
| `api.abler.tirol` | `references/api.md` | API + Minimal-Frontend |
| `barcode.abler.tirol` | `references/barcode.md` | Pure Frontend |
| `pdf.abler.tirol` | `references/pdf.md` | Pure Frontend |
| `klara.abler.tirol` | `references/klara.md` | Fullstack |
| `sims.abler.tirol` | `references/sims.md` | Fullstack |
| Neue Subdomain | `references/new-product.md` | Checkliste |

**Neue Subdomain?** → Lies `references/new-product.md` für die Checkliste.

---

## Schritt 2: Universelle Regeln (gelten für ALLE Subdomains)

### Typografie — unveränderlich

```html
<!-- IMMER über api.abler.tirol — nie Google Fonts -->
<link rel="preconnect" href="https://api.abler.tirol" />
<link rel="stylesheet" href="https://api.abler.tirol/fonts/abler-stack.css" />
```

| Rolle | Font | Verwendung |
|---|---|---|
| Headlines | `DM Serif Display` | Hero-Titel, H1/H2 |
| Body / UI | `Inter` | Fließtext, Labels |
| Code / Mono | `DM Mono` | Tags, Badges, Code, Terminal |

```css
--text-display: clamp(3rem, 8vw, 6rem);
--text-h1:      clamp(2.2rem, 5vw, 3.75rem);
--text-h2:      clamp(1.8rem, 3.5vw, 3rem);
--text-body:    0.95rem;
--text-label:   0.72rem; /* DM Mono + uppercase + letter-spacing: 0.18em */
```

### Geteilte Neutrals

```css
:root {
  --white:      #ffffff;
  --bg-light:   #f7f7f4;
  --bg-subtle:  #fbfbf9;
  --ink:        #0f172a;
  --ink-2:      #475569;
  --ink-3:      #94a3b8;
  --border:     #e2e8f0;
  --border-sub: rgba(226,232,240,0.7);
  --radius-xl:  2rem;
  --radius-lg:  1.5rem;
  --shadow-card: 0 25px 80px -30px rgba(15,23,42,0.18);
  --shadow-sm:   0 1px 3px rgba(15,23,42,0.06);
  --sans:  'Inter', sans-serif;
  --mono:  'DM Mono', monospace;
  --serif: 'DM Serif Display', serif;
}
```

### Layout

- Max-Width: `72rem` · Section-Padding: `5rem` Desktop / `3rem` Mobile
- Seitenabstand: `1.5rem` Mobile · `2.5rem` Tablet+

### Komponenten

Buttons immer Pill-Form (`border-radius: 999px`), nie eckig.
Cards hover: `transform: translateY(-4px)` + Shadow.
Tags: `DM Mono`, `border-radius: 999px`.
Nav: sticky, max. 4–5 Einträge, Logo in `DM Mono uppercase`.

### Animationen

```css
@keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
/* Stagger: 0.05s–0.15s · max duration: 0.7s · kein Parallax, kein Bounce */
```

### Zweisprachigkeit DE/EN

```html
<body class="de">
<p data-lang="de">Text</p>  <p data-lang="en">Text</p>
```
```css
[data-lang], span[data-lang] { display: none !important; }
body.de [data-lang="de"], body.de span[data-lang="de"] { display: revert !important; }
body.en [data-lang="en"], body.en span[data-lang="en"] { display: revert !important; }
body.de span[data-lang="de"], body.en span[data-lang="en"] { display: inline !important; }
```

### Docker / Traefik

Pure Frontend → `nginx:alpine`. Jede Domain bekommt einen **eigenen Traefik-Router**
(separates TLS-Zertifikat pro Domain, nie mehrere Domains in einem Router).

---

## Schritt 3: Subdomain-Referenz lesen

Lies jetzt die passende Datei aus `references/` für Farben, Charakter
und subdomain-spezifische Eigenheiten.

---

## Verbotsliste (alle Subdomains)

❌ Fonts von Google · ❌ Lila/Violette Gradienten · ❌ System-Fonts
❌ Eckige Buttons · ❌ `#000` als Textfarbe · ❌ >2 Akzentfarben gleichzeitig
❌ Hardcodierte Farbwerte · ❌ Überfüllte Nav · ❌ Parallax / Bounce
