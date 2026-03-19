# FINDINGS

Stand: 2026-03-19
Basis: Review der aktuell implementierten Workflows anhand von Frontend, Services und Backend
Hinweis: keine Laufzeittests ausgefuehrt, Findings basieren auf Codeanalyse

## Hoch

### 1. Rechnungserzeugung selektierte zuvor die falschen Lieferscheine

**Problem**

Das Frontend behandelte jeden Lieferschein ohne `billId` als "offen" und damit als Rechnungskandidat. Das Backend akzeptiert fuer `POST /bills/generate` aber nur Lieferscheine mit `state === CLOSED`.

**Auswirkung im Workflow**

Ein Benutzer konnte in der Kundendetailansicht Lieferscheine auswaehlen und auf `Rechnung erzeugen` klicken, obwohl diese serverseitig noch `open` oder `changed` waren. Die Rechnungserzeugung scheiterte dann mit `Lieferscheine noch nicht erstellt`.

**Codebeleg**

- `apps/sim-system/src/app/models/bill.model.ts:41`
- `apps/sim-system/src/app/models/bill.model.ts:42`
- `apps/sim-system/src/app/views/customer-detail/customer-detail.component.ts:83`
- `apps/sim-system/src/app/views/customer-detail/customer-detail.component.ts:91`
- `apps/sim-system/src/app/views/customer-detail/customer-detail.component.ts:163`
- `apps/sim-system/src/app/views/customer-detail/customer-detail.component.ts:174`
- `apps/server/src/models/bills/bill.service.ts:47`
- `apps/server/src/models/bills/bill.service.ts:48`

**Status**

UI angepasst:

- Filter `Nur unverrechnete` bleibt bestehen
- nur `closed` und noch nicht verrechnete Lieferscheine sind selektierbar
- andere unverrechnete Eintraege bleiben sichtbar und werden in der Tabelle als `Noch nicht erzeugt` markiert

### 2. Lieferschein-PDF-Aufruf veraenderte den Serverzustand, aber die UI blieb veraltet

**Problem**

`GET /slipsheets/:id/pdf` schliesst standardmaessig den Lieferschein bzw. erzeugt Nummer und PDF, weil `close` per Default `true` ist. Die Frontend-Aktionen zum Oeffnen oder Herunterladen des PDFs aktualisierten den lokalen Datensatz danach zunaechst nicht.

**Auswirkung im Workflow**

Nach einem PDF-Aufruf sah der Benutzer im UI weiterhin den alten Zustand. Status, Nummer, Selektionslogik und Folgeaktionen konnten auf veralteten Daten basieren.

**Codebeleg**

- `apps/server/src/models/bills/controllers/slipsheet.controller.ts:110`
- `apps/server/src/models/bills/controllers/slipsheet.controller.ts:113`
- `apps/server/src/models/bills/controllers/slipsheet.controller.ts:140`
- `apps/server/src/models/bills/slipsheet.service.ts:89`
- `apps/server/src/models/bills/slipsheet.service.ts:95`
- `apps/sim-system/src/app/views/customer-detail/customer-detail.component.ts:229`
- `apps/sim-system/src/app/views/customer-detail/customer-detail.component.ts:233`
- `apps/sim-system/src/app/components/slipsheet-editor/slipsheet-editor.component.ts:192`
- `apps/sim-system/src/app/components/slipsheet-editor/slipsheet-editor.component.ts:195`

**Status**

Frontend angepasst:

- nach erfolgreichem `GET /slipsheets/:id/pdf` wird der betroffene Lieferschein erneut ueber `GET /slipsheets/:id` geladen
- die lokale Ansicht wird danach aktualisiert
- kein neuer Endpoint noetig

### 3. `Neue Bestellung` haengt neue Positionen potentiell an den falschen offenen Lieferschein

**Problem**

`/order/new` laedt fuer den ausgewaehlten Kunden alle offenen/geaenderten Lieferscheine und verwendet einfach `slips[0]`. Die Backend-Liste ist an dieser Stelle nicht sortiert oder als eindeutiger "aktueller" Lieferschein definiert.

**Auswirkung im Workflow**

Neue Positionen koennen an einem beliebigen vorhandenen Lieferschein landen, wenn mehrere offene oder geaenderte Belege existieren.

**Codebeleg**

- `apps/sim-system/src/app/views/order-new/order-new.component.ts:61`
- `apps/sim-system/src/app/views/order-new/order-new.component.ts:63`
- `apps/server/src/models/bills/controllers/slipsheet.controller.ts:80`
- `apps/server/src/models/bills/controllers/slipsheet.controller.ts:81`
- `apps/server/src/models/bills/slipsheet.service.ts:160`
- `apps/server/src/models/bills/slipsheet.service.ts:171`

**Empfehlung**

Entweder serverseitig genau einen "aktiven" Lieferschein liefern oder clientseitig explizit sortieren bzw. den Benutzer waehlen lassen.

## Mittel

### 4. Rechnungs-PDF kann im Fehlerfall nicht aus der UI neu erzeugt werden

**Problem**

Backend und Angular-Service unterstuetzen die Neugenerierung eines Rechnungs-PDFs bereits, aber die Rechnungsdetailseite bietet dafuer keine Aktion an. Bei fehlendem PDF zeigt die UI nur eine Fehlermeldung.

**Auswirkung im Workflow**

Der Benutzer bekommt die Meldung `PDF nicht gefunden. Bitte neu erzeugen.`, kann diese Neugenerierung im UI aber gar nicht anstossen.

**Codebeleg**

- `apps/server/src/models/bills/controllers/bill.controller.ts:128`
- `apps/server/src/models/bills/controllers/bill.controller.ts:133`
- `apps/sim-system/src/app/services/bill.service.ts:33`
- `apps/sim-system/src/app/views/bill-detail/bill-detail.component.ts:46`
- `apps/sim-system/src/app/views/bill-detail/bill-detail.component.ts:56`
- `apps/sim-system/src/app/views/bill-detail/bill-detail.component.html:52`

**Empfehlung**

Auf der Rechnungsdetailseite einen `PDF neu erzeugen`-Button einbauen, der `billService.recreate(...)` nutzt und danach den Download erneut versucht.

### 5. Dashboard-Deep-Link zur Artikelsuche funktioniert nicht

**Problem**

Das Dashboard navigiert mit `queryParams: { code }` zur Artikelliste. Die Artikelliste liest aber keine Query-Parameter aus und filtert nur ueber lokale FormControls.

**Auswirkung im Workflow**

Ein Klick aus dem Dashboard auf einen Artikel oder Barcode landet zwar auf `/articles`, die erwartete Vorfilterung nach Code passiert aber nicht.

**Codebeleg**

- `apps/sim-system/src/app/views/dashboard/dashboard.component.ts:83`
- `apps/sim-system/src/app/views/dashboard/dashboard.component.ts:84`
- `apps/sim-system/src/app/views/articles/articles.component.ts:22`
- `apps/sim-system/src/app/views/articles/articles.component.ts:23`
- `apps/sim-system/src/app/views/articles/articles.component.ts:37`

**Empfehlung**

`ArticlesComponent` sollte `ActivatedRoute.queryParamMap` lesen und `codeCtrl` bzw. `searchCtrl` initial daraus setzen.

### 6. Login-Workflow ist im Frontend vorbereitet, aber als Gesamtablauf nicht lauffaehig

**Problem**

Es gibt `LoginComponent`, `AuthenticationService` und `authGuard`, aber:

- die Route `/login` ist nicht registriert
- das Frontend ruft `users/login` und `users/me/refresh` auf
- das Backend bietet diese Endpunkte nicht an

**Auswirkung im Workflow**

Sobald Auth aktiviert oder ein Guard benutzt wird, endet der Ablauf auf einer fehlenden Route oder in 404-API-Fehlern.

**Codebeleg**

- `apps/sim-system/src/app/app.routes.ts`
- `apps/sim-system/src/app/helpers/auth.guard.ts:12`
- `apps/sim-system/src/app/services/authentication.service.ts:23`
- `apps/sim-system/src/app/services/authentication.service.ts:40`
- `apps/server/src/models/users/users.controller.ts:44`
- `apps/server/src/models/users/users.controller.ts:59`
- `apps/server/src/models/users/users.controller.ts:71`
- `apps/server/src/models/users/users.controller.ts:89`

**Empfehlung**

Entweder Auth-Endpunkte und Login-Route vollstaendig implementieren oder den toten Auth-Pfad bis zur echten Einfuehrung konsequent entfernen.

### 7. Kundenformular validiert das einzig serverseitig verpflichtende Feld nicht

**Problem**

`customerNumber` ist im Backend per DTO Pflichtfeld, im Frontend-Formular aber ohne Validator konfiguriert.

**Auswirkung im Workflow**

Benutzer koennen formal "gueltig" absenden, bekommen aber erst vom Backend einen Validierungsfehler zurueck.

**Codebeleg**

- `apps/server/src/models/customer/dto/create-customer.dto.ts:25`
- `apps/server/src/models/customer/dto/create-customer.dto.ts:26`
- `apps/sim-system/src/app/views/customer-edit/customer-edit.component.ts:23`
- `apps/sim-system/src/app/views/customer-edit/customer-edit.component.ts:29`
- `apps/sim-system/src/app/views/customer-edit/customer-edit.component.ts:71`

**Empfehlung**

`customerNumber` im Angular-Formular mit `Validators.required` versehen und den Fehler direkt im UI anzeigen.

## Niedrig

### 8. Ein Lieferschein mit nur Annotationen kann geloescht werden

**Problem**

Die Generierung behandelt Annotationen als relevanten Inhalt. Die Loeschlogik dagegen blockiert nur Lieferscheine mit Positionen. Im Frontend ist `canDelete()` ebenfalls nur an `orderEntries.length === 0` gekoppelt.

**Auswirkung im Workflow**

Ein Benutzer kann einen Lieferschein loeschen, obwohl bereits Kommissionen/Annotationen darauf erfasst wurden.

**Codebeleg**

- `apps/server/src/models/bills/slipsheet.service.ts:46`
- `apps/server/src/models/bills/slipsheet.service.ts:50`
- `apps/server/src/models/bills/slipsheet.service.ts:81`
- `apps/sim-system/src/app/components/slipsheet-editor/slipsheet-editor.component.ts:62`
- `apps/sim-system/src/app/components/slipsheet-editor/slipsheet-editor.component.ts:64`

**Empfehlung**

Loeschlogik an dieselbe inhaltliche Definition koppeln wie die PDF-/Close-Logik, also Positionen und Annotationen gemeinsam betrachten.
