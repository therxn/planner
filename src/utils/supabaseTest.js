import { supabase } from '../lib/supabase.js';

// Test-Funktionen für Supabase-Verbindung
export const supabaseTest = {
  // 1. Grundlegende Verbindung testen
  async testConnection() {
    console.log('🔍 Teste Supabase-Verbindung...');
    
    try {
      // Prüfe Umgebungsvariablen
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        console.error('❌ Umgebungsvariablen nicht gefunden!');
        console.log('VITE_SUPABASE_URL:', url ? '✅ Vorhanden' : '❌ Fehlt');
        console.log('VITE_SUPABASE_ANON_KEY:', key ? '✅ Vorhanden' : '❌ Fehlt');
        return false;
      }
      
      console.log('✅ Umgebungsvariablen gefunden');
      console.log('URL:', url);
      console.log('Key:', key ? 'Vorhanden (verborgen)' : 'Fehlt');
      
      // Teste einfache Abfrage
      const { data, error } = await supabase
        .from('apartments')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Datenbankfehler:', error.message);
        console.log('Details:', error);
        return false;
      }
      
      console.log('✅ Datenbankverbindung erfolgreich!');
      console.log(`📊 Gefundene Wohnungen: ${data || 0}`);
      return true;
      
    } catch (error) {
      console.error('❌ Verbindungsfehler:', error.message);
      return false;
    }
  },

  // 2. Tabellen-Struktur prüfen
  async checkTables() {
    console.log('🔍 Prüfe Datenbankstruktur...');
    
    try {
      // Teste apartments Tabelle
      const { data: apartments, error: aptError } = await supabase
        .from('apartments')
        .select('*')
        .limit(1);
      
      if (aptError) {
        console.error('❌ Apartments-Tabelle nicht gefunden:', aptError.message);
      } else {
        console.log('✅ Apartments-Tabelle existiert');
      }
      
      // Teste bookings Tabelle
      const { data: bookings, error: bookError } = await supabase
        .from('bookings')
        .select('*')
        .limit(1);
      
      if (bookError) {
        console.error('❌ Bookings-Tabelle nicht gefunden:', bookError.message);
      } else {
        console.log('✅ Bookings-Tabelle existiert');
      }
      
      return !aptError && !bookError;
      
    } catch (error) {
      console.error('❌ Fehler beim Prüfen der Tabellen:', error.message);
      return false;
    }
  },

  // 3. Test-Daten einfügen
  async insertTestData() {
    console.log('🔍 Teste Daten-Einfügung...');
    
    try {
      // Test-Wohnung einfügen
      const { data: apartment, error: aptError } = await supabase
        .from('apartments')
        .insert([{
          name: 'Test-Wohnung',
          address: 'Teststraße 1, 12345 Test-Stadt',
          status: 'frei',
          beds: 2,
          description: 'Test-Beschreibung',
          price: 50.00,
          amenities: ['WiFi', 'Test-Ausstattung'],
          last_cleaned: new Date().toISOString().split('T')[0],
          next_maintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          available_from: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single();
      
      if (aptError) {
        console.error('❌ Fehler beim Einfügen der Test-Wohnung:', aptError.message);
        return false;
      }
      
      console.log('✅ Test-Wohnung erfolgreich eingefügt:', apartment);
      
      // Test-Buchung einfügen
      const { data: booking, error: bookError } = await supabase
        .from('bookings')
        .insert([{
          id: `test-booking-${Date.now()}`,
          apartment_id: apartment.id,
          title: 'Test-Buchung',
          company: 'Test-Firma',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'upcoming',
          guest_name: 'Test-Gast',
          guest_email: 'test@test.de',
          guest_phone: '+49 123 456789',
          notes: 'Test-Notizen',
          price_per_night: 50.00,
          total_price: 350.00
        }])
        .select()
        .single();
      
      if (bookError) {
        console.error('❌ Fehler beim Einfügen der Test-Buchung:', bookError.message);
        // Test-Wohnung wieder löschen
        await supabase.from('apartments').delete().eq('id', apartment.id);
        return false;
      }
      
      console.log('✅ Test-Buchung erfolgreich eingefügt:', booking);
      
      // Test-Daten wieder löschen
      await supabase.from('bookings').delete().eq('id', booking.id);
      await supabase.from('apartments').delete().eq('id', apartment.id);
      
      console.log('✅ Test-Daten erfolgreich gelöscht');
      
      return true;
      
    } catch (error) {
      console.error('❌ Fehler beim Test-Daten-Insert:', error.message);
      return false;
    }
  },

  // 4. Vollständiger Test
  async runFullTest() {
    console.log('🚀 Starte vollständigen Supabase-Test...');
    console.log('=====================================');
    
    const tests = [
      { name: 'Verbindungstest', fn: this.testConnection },
      { name: 'Tabellenstruktur', fn: this.checkTables },
      { name: 'Daten-Operationen', fn: this.insertTestData }
    ];
    
    let allPassed = true;
    
    for (const test of tests) {
      console.log(`\n📋 ${test.name}:`);
      const result = await test.fn();
      if (!result) {
        allPassed = false;
      }
    }
    
    console.log('\n=====================================');
    if (allPassed) {
      console.log('🎉 Alle Tests erfolgreich! Supabase ist bereit.');
    } else {
      console.log('⚠️  Einige Tests sind fehlgeschlagen. Prüfe die Konfiguration.');
    }
    
    return allPassed;
  },

  // 5. Aktuellen Status anzeigen
  async showStatus() {
    console.log('📊 Supabase Status-Übersicht:');
    
    try {
      // Anzahl Wohnungen
      const { count: apartmentCount, error: aptError } = await supabase
        .from('apartments')
        .select('*', { count: 'exact', head: true });
      
      // Anzahl Buchungen
      const { count: bookingCount, error: bookError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      console.log(`🏠 Wohnungen in Datenbank: ${apartmentCount || 0}`);
      console.log(`📅 Buchungen in Datenbank: ${bookingCount || 0}`);
      
      if (aptError || bookError) {
        console.error('Fehler beim Abrufen der Counts:', { aptError, bookError });
      }
      
    } catch (error) {
      console.error('❌ Fehler beim Status-Abruf:', error.message);
    }
  }
};

// Für einfache Verwendung in der Browser-Konsole exportieren
if (typeof window !== 'undefined') {
  window.supabaseTest = supabaseTest;
}
