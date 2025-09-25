import { useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { migrationUtils } from '../../utils/migration.js';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Starte Supabase-Test...', 'info');
      
      // 1. Umgebungsvariablen prüfen
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        addResult('❌ Umgebungsvariablen fehlen!', 'error');
        addResult(`URL: ${url ? '✅ Vorhanden' : '❌ Fehlt'}`, url ? 'success' : 'error');
        addResult(`Key: ${key ? '✅ Vorhanden' : '❌ Fehlt'}`, key ? 'success' : 'error');
        return;
      }
      
      addResult('✅ Umgebungsvariablen gefunden', 'success');
      addResult(`URL: ${url}`, 'info');
      
       // 2. Datenbankverbindung testen
       addResult('🔍 Teste Datenbankverbindung...', 'info');
       
       const { count: apartmentCount, error } = await supabase
         .from('apartments')
         .select('*', { count: 'exact', head: true });
       
       if (error) {
         addResult(`❌ Datenbankfehler: ${error.message}`, 'error');
         
         if (error.message.includes('relation "apartments" does not exist')) {
           addResult('💡 Die Tabellen wurden noch nicht erstellt!', 'warning');
           addResult('Du musst das SQL-Schema in der Supabase Console ausführen.', 'warning');
         }
       } else {
         addResult('✅ Datenbankverbindung erfolgreich!', 'success');
         addResult(`📊 Wohnungen in Datenbank: ${apartmentCount || 0}`, 'info');
        
        // Zeige Wohnungs-IDs für Debug
        if (apartmentCount > 0) {
          const { data: apartments } = await supabase
            .from('apartments')
            .select('id, name')
            .order('id');
          
          if (apartments) {
            addResult(`🏠 Wohnungs-IDs: ${apartments.map(apt => `${apt.name}(${apt.id})`).join(', ')}`, 'info');
          }
        }
         
         // 3. Buchungen testen
         const { count: bookingCount, error: bookingError } = await supabase
           .from('bookings')
           .select('*', { count: 'exact', head: true });
         
         if (bookingError) {
           addResult(`❌ Buchungen-Tabelle Fehler: ${bookingError.message}`, 'error');
         } else {
           addResult(`📅 Buchungen in Datenbank: ${bookingCount || 0}`, 'info');
           
           // Zeige Buchungs-Zuordnungen für Debug
           if (bookingCount > 0) {
             const { data: bookings } = await supabase
               .from('bookings')
               .select('id, title, apartment_id')
               .order('id');
             
             if (bookings) {
               addResult(`📅 Buchungs-Zuordnungen: ${bookings.map(b => `${b.title}→Apt(${b.apartment_id})`).join(', ')}`, 'info');
             }
           }
         }
       }
      
    } catch (error) {
      addResult(`❌ Unerwarteter Fehler: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const runMigration = async () => {
    setIsMigrating(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starte Migration der Mock-Daten...', 'info');
      
      // Prüfe erst die Verbindung
      addResult('🔍 Prüfe Datenbankverbindung...', 'info');
      const connectionTest = await migrationUtils.testConnection();
      
      if (!connectionTest) {
        addResult('❌ Datenbankverbindung fehlgeschlagen!', 'error');
        return;
      }
      
      addResult('✅ Datenbankverbindung erfolgreich', 'success');
      
      // Führe Migration durch
      addResult('📦 Migriere Wohnungen...', 'info');
      const apartments = await migrationUtils.migrateApartments();
      addResult(`✅ ${apartments.length} Wohnungen migriert`, 'success');
      
      // Erstelle Mapping für Buchungen
      addResult('📅 Migriere Buchungen...', 'info');
      const { mockApartments } = await import('../../data/mockData.js');
      const apartmentMapping = {};
      mockApartments.forEach((mockApt, index) => {
        apartmentMapping[mockApt.id] = apartments[index].id;
      });
      
      const bookings = await migrationUtils.migrateBookings(apartmentMapping);
      addResult(`✅ ${bookings.length} Buchungen migriert`, 'success');
      
      addResult('🎉 Migration erfolgreich abgeschlossen!', 'success');
      addResult(`📊 Gesamt: ${apartments.length} Wohnungen, ${bookings.length} Buchungen`, 'info');
      
      // Zeige finalen Status
      setTimeout(async () => {
        addResult('📈 Aktueller Datenbankstatus:', 'info');
        const { count: aptCount } = await supabase
          .from('apartments')
          .select('*', { count: 'exact', head: true });
        const { count: bookCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });
        
        addResult(`🏠 Wohnungen in DB: ${aptCount}`, 'success');
        addResult(`📅 Buchungen in DB: ${bookCount}`, 'success');
      }, 1000);
      
    } catch (error) {
      addResult(`❌ Migration fehlgeschlagen: ${error.message}`, 'error');
      console.error('Migration Error:', error);
    } finally {
      setIsMigrating(false);
    }
  };


  const getResultStyle = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
         <h2 className="text-xl font-bold mb-4 text-gray-800">
           🔗 Datenbank Verbindungstest
         </h2>
        
         <div className="flex gap-3 mb-4">
           <button
             onClick={runTest}
             disabled={isLoading || isMigrating}
             className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
           >
             {isLoading ? '⏳ Teste...' : '🚀 Test starten'}
           </button>
           
           <button
             onClick={runMigration}
             disabled={isLoading || isMigrating}
             className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
           >
             {isMigrating ? '⏳ Migriere...' : '📦 Mock-Daten migrieren'}
           </button>
         </div>
        
        {testResults.length > 0 && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Test-Ergebnisse:</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm font-mono ${getResultStyle(result.type)}`}
                >
                  <span className="text-xs text-gray-500">[{result.timestamp}]</span> {result.message}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Bei Fehlern:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Prüfe die .env.local Datei</li>
              <li>2. Stelle sicher, dass URL und Key korrekt sind</li>
              <li>3. Führe das SQL-Schema aus</li>
              <li>4. Starte den Dev-Server neu</li>
            </ol>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🚀 Migration:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>📦 Überträgt alle Mock-Wohnungen</li>
              <li>📅 Überträgt alle Mock-Buchungen</li>
              <li>🔗 Verknüpft Buchungen mit Wohnungen</li>
              <li>⚠️ Kann nur einmal ausgeführt werden</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
