import { useState } from 'react'
import { Home, Calendar, Building, Users, Settings, Trash2 } from 'lucide-react'
import Dashboard from './components/Dashboard/Dashboard'
import TimelineCalendar from './components/Calendar/TimelineCalendar'
import ApartmentHistory from './components/Apartments/ApartmentHistory'
import EinstellungenPage from './components/Settings/EinstellungenPage'
import PapierkorbPage from './components/Papierkorb/PapierkorbPage'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'kalender', label: 'Kalender', icon: Calendar },
    { id: 'wohnungen', label: 'History', icon: Building },
    { id: 'mieter', label: 'Mieter', icon: Users },
    { id: 'einstellungen', label: 'Einstellungen', icon: Settings },
    { id: 'papierkorb', label: 'Papierkorb', icon: Trash2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tab.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && <Dashboard />}

          {activeTab === 'kalender' && <TimelineCalendar />}

          {activeTab === 'wohnungen' && <ApartmentHistory />}

          {activeTab === 'mieter' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Mieter</h2>
              <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600">Mieterverwaltung wird hier implementiert...</p>
              </div>
            </div>
          )}

          {activeTab === 'einstellungen' && <EinstellungenPage />}

          {activeTab === 'papierkorb' && <PapierkorbPage />}
        </main>
      </div>
    </div>
  )
}

export default App
