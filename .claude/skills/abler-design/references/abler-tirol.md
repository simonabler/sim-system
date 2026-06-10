# abler.tirol — Landing Page

## Charakter
Sachlich, übergeordnet, verbindend. Der Anker des Ökosystems.
Kein starker Farbakzent — die Subdomains bringen Farbe.

## Akzentfarben
```css
--accent-primary:   #0f172a;   /* Slate 900 */
--accent-secondary: #334155;   /* Slate 700 */
```

## Produkttyp: Landing / Static
- Reines HTML/CSS/JS — kein Framework, kein Build-Step
- Kein eigenes Backend, kein API-Zugriff
- Docker: `nginx:alpine` mit `index.html`

## Hero-Stil
Hell (`--bg-light`), Dashboard-Widget rechts, fadeUp-Animationen.
Kein Dark Hero — neutrales Intro das alle Produkte zusammenhält.

## Typografie-Gewicht
Ausgewogen. `DM Serif Display` italic für einzelne Wort-Akzente im Hero-Titel.
`Inter` für Body. `DM Mono` für Labels und Nav-Logo.

## Besonderheiten
- Zeigt alle aktiven Produkte als Cards im 2-Spalten-Grid
- 5. oder weitere Cards: `card-wide` (full-width, horizontal Layout Desktop)
- Hero-Widget zeigt Anzahl aktiver Produkte + Status-Zeilen
- Nav-Badges verlinken direkt zu den Subdomains
- Sprach-Toggle DE/EN oben rechts

## Card-Farben pro Produkt
```css
/* api */      linear-gradient(135deg, #0f172a, #334155)
/* klara */    linear-gradient(135deg, #064e3b, #065f46)
/* barcode */  linear-gradient(135deg, #78350f, #92400e)
/* pdf */      linear-gradient(135deg, #1e1b4b, #312e81)
/* sims */     linear-gradient(135deg, #134e4a, #0f3d3a)
/* daedalus */ linear-gradient(135deg, #1a1a2e, #16213e)
```

## Repo
`github.com/simonabler/abler-tirol`

## Neue Produkte hinzufügen
1. CSS-Variable `--<name>-from` / `--<name>-to` in `:root` ergänzen
2. `.card-top-<name>` CSS-Klasse mit Gradient anlegen
3. Card-HTML im Products-Grid einfügen
4. Widget-Zähler erhöhen, Widget-Row ergänzen
5. Nav-Badge optional hinzufügen
