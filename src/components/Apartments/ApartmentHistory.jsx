import { useState, useEffect } from 'react'
import { Calendar, Filter, ChevronLeft, ChevronRight, Building, Clock, User } from 'lucide-react'
import { useSupabaseApartments } from '../../hooks/useSupabaseApartments'
import Badge from '../UI/Badge'

const ApartmentHistory = () => {
  const { apartments, bookings, loading } = useSupabaseApartments()
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  })

  // Filter bookings by date range
  const filteredBookings = selectedApartment ? bookings.filter(booking => {
    if (booking.apartment_id !== selectedApartment.id) return false
    
    if (!dateFilter.startDate && !dateFilter.endDate) return true
    
    const bookingStart = new Date(booking.start_date)
    const bookingEnd = new Date(booking.end_date)
    const filterStart = dateFilter.startDate ? new Date(dateFilter.startDate) : null
    const filterEnd = dateFilter.endDate ? new Date(dateFilter.endDate) : null
    
    if (filterStart && bookingEnd < filterStart) return false
    if (filterEnd && bookingStart > filterEnd) return false
    
    return true
  }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date)) : []

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
    setDateFilter({ startDate: '', endDate: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Building className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Wohnungs-History</h1>
        </div>
        <p className="text-gray-600">
          Wähle eine Wohnung aus, um alle Buchungen und deren Historie anzuzeigen.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wohnungsliste */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Alle Wohnungen</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {apartments.map((apartment) => {
                const apartmentBookings = bookings.filter(b => b.apartment_id === apartment.id)
                const currentBooking = apartmentBookings.find(b => {
                  const now = new Date()
                  const start = new Date(b.start_date)
                  const end = new Date(b.end_date)
                  return now >= start && now <= end
                })

                return (
                  <button
                    key={apartment.id}
                    onClick={() => setSelectedApartment(apartment)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedApartment?.id === apartment.id ? 'bg-blue-50 border-blue-200' : ''
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
                            bis {formatDate(currentBooking.end_date)}
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
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedApartment.name} - Buchungshistorie
                    </h2>
                    <p className="text-sm text-gray-500">
                      {filteredBookings.length} Buchung{filteredBookings.length !== 1 ? 'en' : ''} gefunden
                    </p>
                  </div>
                  
                  {/* Filter */}
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateFilter.startDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      placeholder="Von"
                    />
                    <span className="text-gray-400">bis</span>
                    <input
                      type="date"
                      value={dateFilter.endDate}
                      onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1"
                      placeholder="Bis"
                    />
                    {(dateFilter.startDate || dateFilter.endDate) && (
                      <button
                        onClick={clearFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Zurücksetzen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredBookings.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredBookings.map((booking, index) => {
                      const isCurrent = () => {
                        const now = new Date()
                        const start = new Date(booking.start_date)
                        const end = new Date(booking.end_date)
                        return now >= start && now <= end
                      }

                      const isPast = () => {
                        const now = new Date()
                        const end = new Date(booking.end_date)
                        return now > end
                      }

                      const isFuture = () => {
                        const now = new Date()
                        const start = new Date(booking.start_date)
                        return now < start
                      }

                      return (
                        <div key={booking.id} className="p-4 hover:bg-gray-50">
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
                                    {booking.tenant_name || 'Unbekannter Mieter'}
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
                                    <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                                  </div>
                                  {booking.tenant_phone && (
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{booking.tenant_phone}</span>
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
                  <div className="p-8 text-center">
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
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Wohnung auswählen
              </h3>
              <p className="text-gray-500">
                Wähle eine Wohnung aus der Liste aus, um die Buchungshistorie anzuzeigen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApartmentHistory
