Prompt für Code-KI: Cards hinzufügen/entfernen/bearbeiten (React, JS)

Baue in mein bestehendes React-Dashboard (JavaScript, ohne TypeScript) die folgenden Funktionen ein:

Kontext / Datenmodell

Wir arbeiten mit vorhandenen Mock-Daten


Es existiert bereits ein Dashboard mit Kacheln (Cards) pro Wohnung, Suche/Filter und einem Detail-Modal/Drawer (UI). Erweitere dieses.

Neue Anforderungen

Hinzufügen (Create)

Button „Wohnung hinzufügen“ in der HeaderBar.

Öffnet ein Modal/Drawer mit Formularfeldern:

Pflicht: name, adresse, betten (number), status

Optional: preisProNacht, ausstattung (comma-separated → Array), notizen

id wird automatisch eindeutig generiert (z. B. W-<timestamp>).

Beim Speichern: neue Card erscheint sofort im Grid (optimistisches Update).

Bearbeiten (Update)

Auf jeder Card ein „Bearbeiten“-Icon/Action.

Öffnet ein Bearbeiten-Modal mit denselben Feldern wie beim Hinzufügen (inkl. name → Stammdaten änderbar).

Änderungen werden nach Speichern in der Card reflektiert.

Löschen (Delete)

Auf jeder Card ein „Löschen“-Icon/Action.

Vor dem Entfernen Bestätigungsdialog („Wohnung wirklich löschen?“).

Nach Bestätigung Card aus Grid entfernen.

Validierung & UX

Pflichtfelder validieren (nicht leer, betten > 0).

Fehler inline anzeigen.

Buttons: „Speichern“ (disabled wenn invalid), „Abbrechen“.

Form reset nach erfolgreichem Speichern.

Tastatur-UX: ESC schließt Modal.

State & Persistenz

Lokaler State mit useState/useReducer.

Immutable Updates (keine Mutationen).

Persistiere den Wohnungs-Array in localStorage (Key z. B. apartments.v1):

Beim Start: versuche aus localStorage zu laden, sonst Mock-Daten.

Bei jeder Änderung: Array in localStorage speichern.

Integration

Suche/Filter funktionieren auch mit neu hinzugefügten/editierten Einträgen.

Responsives Grid bleibt erhalten.

Code in JavaScript (keine .ts/.tsx).

Komponenten (Vorschlag)
src/
  components/
    HeaderBar.jsx        // + Button „Wohnung hinzufügen“
    ApartmentCard.jsx    // + Edit/Delete Actions
    ApartmentForm.jsx    // Wiederverwendbares Formular (Add/Edit)
    ApartmentDetail.jsx  // bleibt, optional „Bearbeiten“-Button hier auch
  hooks/
    useApartments.js     // Laden/Speichern (localStorage), CRUD-Funktionen
  utils/
    id.js                // generateId('W')

Technische Details

Formularlogik:

ausstattung: Eingabe als String, beim Speichern via .split(',').map(s=>s.trim()).filter(Boolean) zu Array.

betten, preisProNacht: in Number konvertieren.

ID-Erzeugung:

generateId(prefix='W') => \${prefix}-${Date.now()}``

CRUD-API (intern) in useApartments:

addApartment(payload), updateApartment(id, patch), removeApartment(id)

Alle Funktionen aktualisieren State und localStorage.

Bestätigungsdialog:

window.confirm reicht, oder kleines eigenes Confirm-Modal.

Akzeptanzkriterien (DoD)

Ich kann eine neue Wohnung mit Pflichtfeldern hinzufügen; sie erscheint sofort als Card.

Ich kann eine bestehende Wohnung öffnen und Name (Stammdaten) & andere Felder ändern; Card aktualisiert sich.

Ich kann eine Wohnung löschen; nach Bestätigung verschwindet die Card.

Daten überleben einen Page-Reload dank localStorage.

Validierung verhindert fehlerhafte Eingaben; UX bleibt responsiv.

Kein TypeScript, nur React + JS. Sauber kommentierter Code.