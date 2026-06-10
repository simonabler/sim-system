# WORKFLOW

Stand: 2026-03-19
Quelle: aus aktuellem Frontend, Services und Backend-API abgeleitet
Hinweis: beschreibt den Ist-Zustand des Repos, nicht einen Wunsch-Sollzustand

## Zielbild der Software

Die Software ist eine interne Betriebsanwendung fuer Artikelverwaltung, Lagerfuehrung, Kundenpflege sowie die Erstellung und Nachverfolgung von Lieferscheinen und Rechnungen.

## Abgeleitete Rollen

### 1. Sachbearbeitung Verkauf

Arbeitet mit Kunden, offenen Lieferscheinen, Belegen und Rechnungen.

### 2. Lager / Inventur

Pflegt Lagerstaende, sucht Artikel ueber Code und bucht Inventurdifferenzen.

### 3. Stammdatenpflege / Administration

Pflegt Artikel, Artikelgruppen und Kundenstammdaten.

### 4. Buchhaltung / Verrechnung

Erstellt Rechnungen aus vorhandenen Lieferscheinen und oeffnet Rechnungs-PDFs.

## User Stories

### Dashboard

- Als Mitarbeiter moechte ich ein Dashboard mit KPIs sehen, damit ich offene Lieferscheine, offene Rechnungen und kritische Lagerstaende sofort erkenne.
- Als Mitarbeiter moechte ich nach Zeitraum, Schwellenwert und Artikelgruppe filtern, damit ich nur fuer meinen aktuellen Blick relevante Kennzahlen sehe.
- Als Mitarbeiter moechte ich aus dem Dashboard direkt zu Artikeln, Kunden, Rechnungen oder Inventur springen, damit ich ohne Umwege weiterarbeiten kann.

### Artikelverwaltung

- Als Stammdatenpfleger moechte ich alle Artikel sehen und nach Name oder Code filtern, damit ich einen Artikel schnell finde.
- Als Stammdatenpfleger moechte ich einen neuen Artikel anlegen, damit er fuer Bestellungen und Inventur verfuegbar ist.
- Als Stammdatenpfleger moechte ich einen bestehenden Artikel bearbeiten, damit Preis, Einheit, Warengruppe oder Lagerlogik aktuell bleiben.
- Als Stammdatenpfleger moechte ich einen Artikel loeschen, damit veraltete Stammdaten entfernt werden koennen.
- Als Mitarbeiter moechte ich Artikelgruppen laden koennen, damit Artikel korrekt zugeordnet werden.
- Als Mitarbeiter moechte ich Artikel per CSV importieren koennen, damit groessere Stammdatenmengen schneller eingespielt werden.

### Inventur

- Als Lagermitarbeiter moechte ich einen Artikel per Code scannen oder eingeben, damit ich schnell den Sollbestand sehe.
- Als Lagermitarbeiter moechte ich den Istbestand erfassen und buchen, damit der Lagerstand korrigiert wird.
- Als Lagermitarbeiter moechte ich die letzte Reihe meiner Inventurbuchungen sehen, damit ich unmittelbar Rueckmeldung ueber meine Eingaben habe.

### Kundenverwaltung

- Als Sachbearbeiter moechte ich alle Kunden sehen und suchen, damit ich einen Kunden schnell auswaehlen kann.
- Als Sachbearbeiter moechte ich einen neuen Kunden anlegen, damit ich fuer ihn Bestellungen und Rechnungen erfassen kann.
- Als Sachbearbeiter moechte ich einen Kunden bearbeiten, damit Stammdaten und Standardrabatt aktuell bleiben.
- Als Sachbearbeiter moechte ich einen Kunden mit seinen Lieferscheinen und Rechnungen sehen, damit ich seinen gesamten Bearbeitungsstand an einem Ort habe.
- Als Sachbearbeiter moechte ich kundenbezogene Rabatte pflegen, damit Preise bei Auftraegen automatisch beruecksichtigt werden.

### Auftrag / Lieferschein

- Als Sachbearbeiter moechte ich fuer einen Kunden einen offenen Lieferschein aufbauen, damit ich Bestellpositionen laufend sammeln kann.
- Als Sachbearbeiter moechte ich beim Hinzufuegen eines Artikels nur den Code und die Menge brauchen, damit die Eingabe schnell bleibt.
- Als Sachbearbeiter moechte ich auch Freitextpositionen anlegen, damit nicht katalogisierte Leistungen oder Hinweise erfasst werden koennen.
- Als Sachbearbeiter moechte ich Positionen aendern oder loeschen, damit ein offener Lieferschein korrigierbar bleibt.
- Als Sachbearbeiter moechte ich Annotationen zu einem Lieferschein erfassen, damit Zusatzinformationen dokumentiert sind.
- Als Sachbearbeiter moechte ich ein Lieferschein-PDF oeffnen oder herunterladen, damit ich den Beleg nutzen oder pruefen kann.
- Als Sachbearbeiter moechte ich einen leeren offenen Lieferschein loeschen, damit Fehlanlagen wieder verschwinden.
- Als Sachbearbeiter moechte ich alle Lieferscheine sehen und auf offene eingrenzen, damit ich den Dokumentenstapel priorisieren kann.

### Rechnung

- Als Sachbearbeiter moechte ich auf Kundenseite mehrere offene Lieferscheine auswaehlen und daraus eine Rechnung erzeugen, damit die Verrechnung gesammelt erfolgen kann.
- Als Mitarbeiter moechte ich alle Rechnungen sehen, damit ich offene und abgeschlossene Rechnungen nachvollziehen kann.
- Als Mitarbeiter moechte ich eine Rechnungsdetailansicht oeffnen und das PDF herunterladen, damit ich den Beleg pruefen oder weitergeben kann.
- Als Mitarbeiter moechte ich ein Rechnungs-PDF bei Bedarf neu erzeugen koennen, damit fehlende Dateien wiederhergestellt werden koennen.

### Authentifizierung

- Als Benutzer moechte ich mich anmelden, damit ich nur berechtigten Zugriff auf das System habe.
- Dieser Workflow ist im Frontend vorbereitet, aber im aktuellen Gesamtsystem nicht lauffaehig, weil die benoetigten Backend-Endpunkte fehlen und keine Login-Route registriert ist.

## Hauptworkflows

## 1. Dashboard beobachten und weiter navigieren

### Ziel

Operativen Zustand des Systems schnell erfassen und direkt in den naechsten Arbeitsschritt springen.

### Ablauf

1. Benutzer oeffnet `/dashboard`.
2. System laedt `dashboard/summary`.
3. Benutzer filtert optional nach Tagen, Schwellenwert oder Artikelgruppe.
4. Benutzer springt aus KPI- oder Listenbereichen direkt zu:
   - Artikeln
   - Kunden
   - Rechnungen
   - Inventur

### Ergebnis

Dashboard ist ein Einstiegspunkt und Verteiler fuer Folgeprozesse.

## 2. Artikel anlegen oder pflegen

### Ziel

Artikelstammdaten verfuegbar und korrekt halten.

### Ablauf

1. Benutzer oeffnet `/articles`.
2. System zeigt alle Artikel und erlaubt Filter nach Name und Code.
3. Benutzer oeffnet einen bestehenden Artikel oder navigiert zu einem neuen Artikel.
4. Benutzer pflegt Felder wie:
   - Name
   - Code
   - Artikelnummer
   - Lieferant
   - Typ
   - Preis
   - Einheit
   - Warengruppe
   - `singlePos`
   - `trackStock`
   - `noDiscount`
5. Benutzer speichert oder loescht den Artikel.

### Ergebnis

Artikel stehen fuer Lager, Lieferschein und Rechnung bereit.

## 3. Inventur buchen

### Ziel

Realen Lagerbestand gegen Sollbestand abgleichen und berichtigen.

### Ablauf

1. Benutzer oeffnet `/inventory`.
2. Benutzer scannt oder tippt einen Artikelcode ein.
3. System laedt den Artikel und zeigt den aktuellen Sollbestand.
4. Benutzer erfasst den Istbestand.
5. System berechnet die Differenz.
6. Benutzer bucht die Inventur.
7. System aktualisiert den Lagerstand und fuehrt die Buchung im Kurzprotokoll.

### Ergebnis

Bestand und Inventurhistorie werden fortgeschrieben.

## 4. Kunden anlegen oder bearbeiten

### Ziel

Verrechenbare Kundenstammdaten pflegen.

### Ablauf

1. Benutzer oeffnet `/customers`.
2. System zeigt die Kundenliste mit Suche.
3. Benutzer erstellt einen neuen Kunden oder oeffnet einen bestehenden Datensatz.
4. Benutzer pflegt u. a.:
   - Firmenname
   - Vorname / Nachname
   - E-Mail
   - Kundennummer
   - Telefonnummern
   - Adresse
   - UID
   - Kundenrabatt
5. Benutzer speichert den Datensatz.

### Ergebnis

Kunden koennen fuer offene Lieferscheine und Rechnungen verwendet werden.

## 5. Neue Bestellung bzw. offenen Lieferschein starten

### Ziel

Fuer einen Kunden einen offenen Arbeitsbeleg erzeugen oder fortsetzen.

### Ablauf

1. Benutzer oeffnet `/order/new`.
2. System zeigt eine Kundensuche.
3. Benutzer waehlt einen Kunden aus.
4. System versucht, einen offenen Lieferschein fuer diesen Kunden zu laden.
5. Falls keiner existiert, wird beim ersten Hinzufuegen einer Position ein neuer Lieferschein erzeugt.

### Ergebnis

Ein Kunde ist aktiv ausgewaehlt und ein offener Lieferschein steht zur Bearbeitung bereit.

## 6. Artikelposition zu Lieferschein hinzufuegen

### Ziel

Standardartikel schnell auf einen offenen Lieferschein bringen.

### Ablauf

1. Benutzer arbeitet im `SlipsheetEditor`.
2. Benutzer gibt Artikelcode und Menge ein.
3. System laedt den Artikel per Code.
4. Benutzer bestaetigt das Hinzufuegen.
5. Wenn bereits ein offener Lieferschein existiert:
   - Position wird auf bestehendem Lieferschein angelegt oder aktualisiert.
6. Wenn noch kein Lieferschein existiert:
   - System erzeugt einen offenen Lieferschein und fuegt die erste Position direkt hinzu.

### Ergebnis

Der offene Lieferschein enthaelt die neue Artikelposition.

## 7. Freitextposition zu Lieferschein hinzufuegen

### Ziel

Nicht katalogisierte Leistungen oder manuelle Positionen erfassen.

### Ablauf

1. Benutzer oeffnet im `SlipsheetEditor` den Bereich fuer Textpositionen.
2. Benutzer erfasst Text, Menge und Preis.
3. System legt die Position auf dem offenen Lieferschein an oder erzeugt vorher einen neuen offenen Lieferschein.

### Ergebnis

Auch manuelle Positionen koennen in Lieferschein und spaeter Rechnung einfliessen.

## 8. Offenen Lieferschein korrigieren

### Ziel

Offene Belege waehrend der Bearbeitung anpassen.

### Ablauf

1. Benutzer oeffnet einen offenen Lieferschein direkt oder ueber die Kundendetailseite.
2. Benutzer aendert Mengen bestehender Positionen.
3. Benutzer loescht Positionen durch Setzen der Menge auf `0`.
4. Benutzer fuegt bei Bedarf Annotationen hinzu.
5. Benutzer laedt bei Bedarf das PDF herunter.
6. Ein leerer offener Lieferschein kann geloescht werden.

### Ergebnis

Der Lieferschein bleibt bis zur Verrechnung editierbar.

## 9. Kundenansicht als Arbeitszentrale fuer Belege

### Ziel

Alle Belege eines Kunden an einer Stelle bearbeiten und verrechnen.

### Ablauf

1. Benutzer oeffnet `/customers/:id`.
2. System laedt:
   - Kundendaten
   - Lieferscheine des Kunden
   - Rechnungen des Kunden
3. Benutzer kann:
   - offene Lieferscheine filtern
   - einen Lieferschein aktiv waehlen
   - einen Lieferschein im Editor bearbeiten
   - Lieferschein-PDF oeffnen
   - Rechnungs-PDF oeffnen
   - zu Rechnungsdetails springen

### Ergebnis

Kundenansicht ist der wichtigste operative Sammelpunkt fuer Auftrags- und Belegarbeit.

## 10. Rechnung aus offenen Lieferscheinen erzeugen

### Ziel

Mehrere offene oder bearbeitete Lieferscheine gesammelt abrechnen.

### Ablauf

1. Benutzer oeffnet die Kundendetailansicht.
2. Benutzer waehlt offene Lieferscheine aus.
3. System summiert Anzahl und Gesamtwert der Auswahl.
4. Benutzer startet `Rechnung erstellen`.
5. Frontend ruft `POST /bills/generate` mit den ausgewaehlten Lieferschein-IDs auf.
6. Backend erzeugt die Rechnung und verknuepft die Lieferscheine.
7. Frontend aktualisiert Lieferschein- und Rechnungsliste.

### Ergebnis

Aus mehreren Lieferscheinen wird eine Rechnung.

## 11. Rechnungen pruefen und PDF beziehen

### Ziel

Erzeugte Rechnungen einsehen und weiterverwenden.

### Ablauf

1. Benutzer oeffnet `/bills`.
2. System zeigt alle Rechnungen.
3. Benutzer oeffnet eine Rechnung ueber `/bills/:id`.
4. Benutzer laedt das Rechnungs-PDF herunter.
5. Falls die PDF-Datei fehlt, meldet das Frontend den Fehler und verweist implizit auf eine Neugenerierung.

### Ergebnis

Rechnungen sind nachvollziehbar und als PDF nutzbar.

## Nebenworkflows und Querschnittslogik

### 1. Statuslogik bei Lieferscheinen

- Offene Lieferscheine sind aktiv bearbeitbar.
- Nicht mehr offene Lieferscheine gelten im UI als verrechnet oder abgeschlossen.
- Kundenansicht und Lieferscheinlisten arbeiten stark mit dieser Unterscheidung.

### 2. Rabatte

- Kundenspezifische Rabatte und artikelgruppenbezogene Rabatte sind im Datenmodell vorgesehen.
- Beim Hinzufuegen von Artikelpositionen werden Rabatte serverseitig auf Positionen geschrieben.
- Pflege eines Rabatts ist im Service vorgesehen; Loeschen ist im Frontend vorgesehen, aber im Backend aktuell nicht umgesetzt.

### 3. PDF-Nutzung

- Lieferscheine koennen direkt im Browser geoeffnet oder heruntergeladen werden.
- Rechnungen werden heruntergeladen; in der Kundendetailansicht werden sie in neuem Tab geoeffnet.

## Nicht vollstaendig lauffaehige oder inkonsistente Workflows

### 1. Login / Session

- Frontend besitzt `AuthenticationService`, `authGuard` und `LoginComponent`.
- Aktuell fehlt:
  - Route `/login`
  - Backend-Endpunkt `POST /users/login`
  - Backend-Endpunkt `GET /users/me/refresh`
- Daraus folgt:
  - Auth-Workflow ist fachlich erkennbar, technisch aber nicht abgeschlossen.

### 2. Kunde loeschen

- Frontend besitzt `customerService.delete(...)`.
- Backend besitzt im aktuellen `CustomerController` keinen `DELETE /customers/:id`.
- Daraus folgt:
  - Story erkennbar, Workflow derzeit nicht durchgaengig nutzbar.

### 3. Rabatt loeschen

- Frontend besitzt `deleteDiscount(...)`.
- Backend besitzt aktuell keinen passenden Delete-Endpunkt fuer Kundenrabatte.
- Daraus folgt:
  - Rabattpflege ist nur teilweise umgesetzt.

## Priorisierte Kernprozesse aus Produktsicht

Wenn man das aktuelle Repo auf seine tragenden Geschaeftsprozesse reduziert, sind das diese vier:

1. Artikel pflegen und verfuegbar machen
2. Lagerbestand per Inventur korrigieren
3. Fuer Kunden offene Lieferscheine aufbauen und bearbeiten
4. Aus Lieferscheinen Rechnungen erzeugen und PDFs bereitstellen

Diese vier Prozesse sind der fachliche Kern der Software.
