import { useState, useEffect } from 'react'
import { Calendar, Filter, ChevronLeft, ChevronRight, Building, Clock, User } from 'lucide-react'
import { useSupabaseApartments } from '../../hooks/useSupabaseApartments'
import Badge from '../UI/Badge'

const ApartmentHistory = () => {
  const { apartments, bookings, loading } = useSupabaseApartments()
  const [selectedApartment, setSelectedApartment] = useState(null)
  
  // Debug-Informationen
  console.log('ApartmentHistory - apartments:', apartments)
  console.log('ApartmentHistory - bookings:', bookings)
  console.log('ApartmentHistory - loading:', loading)
  // Vordefinierte Zeiträume
  const getDateRange = (days) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  const getDefaultDateRange = () => getDateRange(30) // Letzte 30 Tage als Standard

  const [dateFilter, setDateFilter] = useState(getDefaultDateRange())

  // Filter bookings by date range
  const filteredBookings = selectedApartment ? bookings.filter(booking => {
    if (booking.apartmentId !== selectedApartment.id) return false
    
    if (!dateFilter.startDate && !dateFilter.endDate) return true
    
    const bookingStart = new Date(booking.startDate)
    const bookingEnd = new Date(booking.endDate)
    const filterStart = dateFilter.startDate ? new Date(dateFilter.startDate) : null
    const filterEnd = dateFilter.endDate ? new Date(dateFilter.endDate) : null
    
    if (filterStart && bookingEnd < filterStart) return false
    if (filterEnd && bookingStart > filterEnd) return false
    
    return true
  }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) : []

  // Debug: Zeige gefilterte Buchungen
  console.log('ApartmentHistory - selectedApartment:', selectedApartment)
  console.log('ApartmentHistory - filteredBookings:', filteredBookings)

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'free':
      default:
        return 'bg-green-100 text-green-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied':
        return 'Belegt'
      case 'maintenance':
        return 'Wartung'
      case 'free':
      default:
        return 'Frei'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const clearFilters = () => {
    setDateFilter(getDateRange(30))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Debug: Zeige an, wenn keine Daten vorhanden sind
  if (!loading && apartments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Building className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">History</h1>
          </div>
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Wohnungen gefunden
            </h3>
            <p className="text-gray-500">
              Es wurden keine Wohnungen in der Datenbank gefunden. Bitte füge zuerst Wohnungen hinzu.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header mit Navigation - Modernisiert */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">History</h1>
              <p className="text-gray-600 mt-1">Wähle eine Wohnung aus, um alle Buchungen und deren Historie anzuzeigen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wohnungsliste */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Alle Wohnungen ({apartments.length})
                </h2>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {apartments.map((apartment) => {
                const apartmentBookings = bookings.filter(b => b.apartmentId === apartment.id)
                const currentBooking = apartmentBookings.find(b => {
                  const now = new Date()
                  const start = new Date(b.startDate)
                  const end = new Date(b.endDate)
                  return now >= start && now <= end
                })

                return (
                  <button
                    key={apartment.id}
                    onClick={() => setSelectedApartment(apartment)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 group ${
                      selectedApartment?.id === apartment.id ? 'bg-blue-50 border-blue-200 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{apartment.name}</h3>
                        <p className="text-sm text-gray-500">
                          {apartmentBookings.length} Buchung{apartmentBookings.length !== 1 ? 'en' : ''}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge 
                          variant={currentBooking ? 'occupied' : 'free'}
                          className="text-xs"
                        >
                          {currentBooking ? 'Belegt' : 'Frei'}
                        </Badge>
                        {currentBooking && (
                          <span className="text-xs text-gray-500">
                            bis {formatDate(currentBooking.endDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Buchungsdetails */}
        <div className="lg:col-span-2">
          {selectedApartment ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {selectedApartment.name} - Buchungshistorie
                      </h2>
                      <p className="text-sm text-gray-500">
                        {filteredBookings.length} Buchung{filteredBookings.length !== 1 ? 'en' : ''} gefunden
                      </p>
                    </div>
                  </div>
                  
                  {/* Filter */}
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Zeitraum:</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <input
                          type="date"
                          value={dateFilter.startDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                          className="text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Von"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-2 h-0.5 bg-gray-400"></div>
                        <span className="text-sm text-gray-500 mx-2">bis</span>
                        <div className="w-2 h-0.5 bg-gray-400"></div>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="date"
                          value={dateFilter.endDate}
                          onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                          className="text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Bis"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDateFilter(getDateRange(30))}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md"
                      >
                        30 Tage
                      </button>
                      <button
                        onClick={() => setDateFilter(getDateRange(90))}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md"
                      >
                        90 Tage
                      </button>
                      <button
                        onClick={() => setDateFilter(getDateRange(180))}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md"
                      >
                        180 Tage
                      </button>
                      <button
                        onClick={() => setDateFilter(getDateRange(365))}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 border border-blue-200 shadow-sm hover:shadow-md"
                      >
                        Letztes Jahr
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredBookings.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredBookings.map((booking, index) => {
                      const isCurrent = () => {
                        const now = new Date()
                        const start = new Date(booking.startDate)
                        const end = new Date(booking.endDate)
                        return now >= start && now <= end
                      }

                      const isPast = () => {
                        const now = new Date()
                        const end = new Date(booking.endDate)
                        return now > end
                      }

                      const isFuture = () => {
                        const now = new Date()
                        const start = new Date(booking.startDate)
                        return now < start
                      }

                      return (
                        <div key={booking.id} className="p-4 hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className={`w-3 h-3 rounded-full ${
                                  isCurrent() ? 'bg-blue-500' : 
                                  isPast() ? 'bg-gray-400' : 
                                  'bg-green-500'
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-gray-900">
                                    {booking.guestName || 'Unbekannter Mieter'}
                                  </h3>
                                  <Badge 
                                    variant={booking.status}
                                    className="text-xs"
                                  >
                                    {getStatusText(booking.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                                  </div>
                                  {booking.guestPhone && (
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{booking.guestPhone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {isCurrent() ? 'Aktuell' : isPast() ? 'Vergangen' : 'Geplant'}
                              </div>
                              {booking.notes && (
                                <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                  {booking.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 inline-block">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Keine Buchungen gefunden
                      </h3>
                      <p className="text-gray-500">
                        {dateFilter.startDate || dateFilter.endDate 
                          ? 'Keine Buchungen im gewählten Zeitraum.'
                          : 'Diese Wohnung hat noch keine Buchungen.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-8 text-center bg-gray-50">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 inline-block">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Wohnung auswählen
                  </h3>
                  <p className="text-gray-500">
                    Wähle eine Wohnung aus der Liste aus, um die Buchungshistorie anzuzeigen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApartmentHistory
