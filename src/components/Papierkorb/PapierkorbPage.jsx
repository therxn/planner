import { useState, useEffect } from 'react'
import { Trash2, RotateCcw, Eye, Calendar, Building, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function PapierkorbPage() {
  const [deletedApartments, setDeletedApartments] = useState([])
  const [deletedBookings, setDeletedBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('wohnungen')

  useEffect(() => {
    loadDeletedItems()
  }, [])

  const loadDeletedItems = async () => {
    try {
      // Hier würden normalerweise gelöschte Items aus einer "deleted_items" Tabelle geladen
      // Für jetzt simulieren wir mit leeren Arrays
      setDeletedApartments([])
      setDeletedBookings([])
    } catch (error) {
      console.error('Fehler beim Laden der gelöschten Items:', error)
    } finally {
      setLoading(false)
    }
  }

  const restoreItem = async (type, id) => {
    try {
      if (type === 'apartment') {
        // Hier würde die Wiederherstellung einer Wohnung implementiert
        console.log('Wohnung wiederherstellen:', id)
        // Beispiel: await supabase.from('apartments').insert(deletedApartment)
      } else if (type === 'booking') {
        // Hier würde die Wiederherstellung einer Buchung implementiert
        console.log('Buchung wiederherstellen:', id)
        // Beispiel: await supabase.from('bookings').insert(deletedBooking)
      }
      
      // Nach Wiederherstellung die Listen aktualisieren
      loadDeletedItems()
    } catch (error) {
      console.error('Fehler beim Wiederherstellen:', error)
    }
  }

  const permanentlyDeleteItem = async (type, id) => {
    try {
      if (window.confirm('Möchten Sie dieses Element wirklich dauerhaft löschen?')) {
        if (type === 'apartment') {
          // Hier würde das permanente Löschen implementiert
          console.log('Wohnung dauerhaft löschen:', id)
          // Beispiel: await supabase.from('deleted_apartments').delete().eq('id', id)
        } else if (type === 'booking') {
          // Hier würde das permanente Löschen implementiert
          console.log('Buchung dauerhaft löschen:', id)
          // Beispiel: await supabase.from('deleted_bookings').delete().eq('id', id)
        }
        
        // Nach Löschung die Listen aktualisieren
        loadDeletedItems()
      }
    } catch (error) {
      console.error('Fehler beim dauerhaften Löschen:', error)
    }
  }

  const DeletedItemCard = ({ item, type }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {type === 'apartment' ? (
              <Building className="h-5 w-5 text-blue-500 mr-2" />
            ) : (
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{item.name || item.title}</h3>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            {type === 'apartment' ? (
              <>
                <p><span className="font-medium">Adresse:</span> {item.address}</p>
                <p><span className="font-medium">Betten:</span> {item.beds}</p>
                <p><span className="font-medium">Preis:</span> {item.price}€/Nacht</p>
              </>
            ) : (
              <>
                <p><span className="font-medium">Firma:</span> {item.company}</p>
                <p><span className="font-medium">Gast:</span> {item.guestName}</p>
                <p><span className="font-medium">Zeitraum:</span> {item.startDate} - {item.endDate}</p>
              </>
            )}
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Gelöscht am: {new Date(item.deletedAt).toLocaleDateString('de-DE')}</p>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => restoreItem(type, item.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Wiederherstellen"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => permanentlyDeleteItem(type, item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Dauerhaft löschen"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Lade gelöschte Elemente...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Trash2 className="h-8 w-8 text-red-500 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Papierkorb</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('wohnungen')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wohnungen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gelöschte Wohnungen ({deletedApartments.length})
            </button>
            <button
              onClick={() => setActiveTab('buchungen')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'buchungen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gelöschte Buchungen ({deletedBookings.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'wohnungen' && (
          <div>
            {deletedApartments.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine gelöschten Wohnungen</h3>
                <p className="text-gray-500">Alle gelöschten Wohnungen werden hier angezeigt.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {deletedApartments.map((apartment) => (
                  <DeletedItemCard key={apartment.id} item={apartment} type="apartment" />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'buchungen' && (
          <div>
            {deletedBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine gelöschten Buchungen</h3>
                <p className="text-gray-500">Alle gelöschten Buchungen werden hier angezeigt.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {deletedBookings.map((booking) => (
                  <DeletedItemCard key={booking.id} item={booking} type="booking" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Eye className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Hinweis</h3>
            <p className="text-sm text-blue-700 mt-1">
              Gelöschte Elemente bleiben 30 Tage im Papierkorb und können wiederhergestellt werden. 
              Nach Ablauf dieser Zeit werden sie automatisch dauerhaft gelöscht.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PapierkorbPage
