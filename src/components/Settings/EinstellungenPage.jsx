import React, { useState } from 'react';
import { Database, Settings, ChevronRight } from 'lucide-react';
import SupabaseTest from '../Debug/SupabaseTest';

const EinstellungenPage = () => {
  const [showDbTest, setShowDbTest] = useState(false);

  const settingsSections = [
    {
      id: 'database',
      title: 'Datenbank',
      description: 'Datenbankverbindung und Systemtests',
      icon: Database,
      items: [
        {
          id: 'db-test',
          title: 'Datenbank Verbindungstest',
          description: 'Teste die Verbindung zu Supabase und prüfe Tabellen',
          action: () => setShowDbTest(!showDbTest),
          isActive: showDbTest
        }
      ]
    },
    {
      id: 'system',
      title: 'System',
      description: 'Allgemeine Systemeinstellungen',
      icon: Settings,
      items: [
        {
          id: 'general',
          title: 'Allgemeine Einstellungen',
          description: 'Sprache, Zeitzone und andere Grundeinstellungen',
          action: () => alert('Noch nicht implementiert'),
          isActive: false
        }
      ]
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Einstellungen</h2>
      
      {/* Einstellungs-Kategorien */}
      <div className="space-y-6">
        {settingsSections.map((section) => {
          const SectionIcon = section.icon;
          
          return (
            <div key={section.id} className="bg-white rounded-lg shadow">
              {/* Kategorie Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <SectionIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Kategorie Items */}
              <div className="divide-y divide-gray-200">
                {section.items.map((item) => (
                  <div key={item.id} className="px-6 py-4">
                    <button
                      onClick={item.action}
                      className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.isActive && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Aktiv
                          </span>
                        )}
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                          item.isActive ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>
                    
                    {/* Expandierbarer Inhalt für DB-Test */}
                    {item.id === 'db-test' && showDbTest && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <SupabaseTest />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zusätzliche Informationen */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Hilfe</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Datenbank Verbindungstest:</strong> Überprüft die Verbindung zu Supabase</p>
          <p>• Bei Problemen prüfe deine .env.local Datei</p>
          <p>• Weitere Einstellungen werden nach und nach hinzugefügt</p>
        </div>
      </div>
    </div>
  );
};

export default EinstellungenPage;
