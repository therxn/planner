# Datenverwaltung - Supabase Integration

## ⚠️ Wichtiger Hinweis

**Das System verwendet jetzt ausschließlich die Supabase-Datenbank!**

Die Mock-Daten-Dateien (`mockData.js` und `bookingData.js`) sind **deaktiviert** und werden nicht mehr verwendet.

## Aktive Datenquellen

- ✅ **Supabase-Datenbank**: Hauptdatenquelle für alle Wohnungen und Buchungen
- ❌ **Mock-Daten**: Deaktiviert (nur noch als Backup vorhanden)
- ❌ **localStorage**: Nicht mehr verwendet

## Verwendete Hooks

- ✅ **`useSupabaseApartments`**: Aktiver Hook für alle Datenoperationen
- ❌ **`useApartments`**: Deaktiviert (verwendet Mock-Daten)

## Datenbank-Schema

### Apartments Tabelle
- `id` (UUID, Primary Key)
- `name` (Text)
- `address` (Text)
- `status` (Text: 'frei', 'belegt', 'wartung')
- `beds` (Integer)
- `description` (Text)
- `price` (Decimal)
- `amenities` (JSON Array)
- `last_cleaned` (Date)
- `next_maintenance` (Date)
- `occupied_until` (Date, nullable)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Bookings Tabelle
- `id` (Text, Primary Key)
- `apartment_id` (UUID, Foreign Key)
- `title` (Text)
- `company` (Text)
- `start_date` (Date)
- `end_date` (Date)
- `status` (Text: 'active', 'upcoming', 'completed', 'cancelled')
- `guest_name` (Text)
- `guest_email` (Text)
- `guest_phone` (Text)
- `notes` (Text)
- `price_per_night` (Decimal)
- `total_price` (Decimal)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Status-Berechnung

Der Status der Wohnungen wird **automatisch** basierend auf den Buchungsdaten berechnet:

- **Frei**: Keine aktiven Buchungen für heute
- **Belegt**: Aktive Buchung für heute (außer Wartung)
- **Wartung**: Aktive Buchung mit "Wartung" oder "Hausmeister" im Titel/Unternehmen

## Wiederherstellung der Mock-Daten

Falls du die Mock-Daten wieder aktivieren möchtest:

1. Entferne die Warnung aus den Dateien
2. Ändere die Imports in den Komponenten von `useSupabaseApartments` zurück zu `useApartments`
3. Stelle sicher, dass die Mock-Daten aktuell sind

## Support

Bei Fragen zur Datenbank-Integration oder Problemen mit Supabase, überprüfe:
- Supabase-Verbindung in `src/lib/supabase.js`
- Umgebungsvariablen (`.env.local`)
- Datenbank-Schema in Supabase Dashboard
