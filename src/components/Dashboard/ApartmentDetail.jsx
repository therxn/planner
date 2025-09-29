import { useState } from 'react';
import { 
  X,
  MapPin, 
  Bed, 
  Euro, 
  Calendar, 
  Clock, 
  Wifi, 
  Car, 
  Home, 
  TreePine, 
  Trees, 
  WashingMachine,
  Phone,
  Mail,
  Star,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Modal from '../UI/Modal';
import Badge from '../UI/Badge';
import MiniCalendar from './MiniCalendar';
import BookingList from '../Booking/BookingList';
import { STATUS_COLORS } from '../../utils/constants';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';

// Icon-Mapping für Amenities
const getAmenityIcon = (amenity) => {
  const iconMap = {
    'WiFi': Wifi,
    'Parkplatz': Car,
    'Balkon': Home,
    'Terrasse': TreePine,
    'Garten': Trees,
    'Waschmaschine': WashingMachine
  };
  return iconMap[amenity] || Home;
};

// Apartment-Detail-Komponente
const ApartmentDetail = ({ 
  apartment, 
  isOpen, 
  onClose, 
  onEdit, 
  onUpdateApartment,
  bookings = [], 
  onAddBooking, 
  onUpdateBooking, 
  onDeleteBooking 
}) => {
  const [showSaved, setShowSaved] = useState(false);
  const [showSavedMaintenance, setShowSavedMaintenance] = useState(false);
  const [isMainInfoCollapsed, setIsMainInfoCollapsed] = useState(true);
  const { bookings: allBookings, getApartmentCurrentStatus } = useApartments();
  
  if (!apartment) return null;

  // Verwende aktuellen Status basierend auf Buchungen
  const currentStatus = getApartmentCurrentStatus(apartment);
  const statusConfig = STATUS_COLORS[currentStatus] || STATUS_COLORS.frei;

  // Berechne Tage seit letzter Reinigung
  const getDaysSinceCleaning = () => {
    const lastCleaned = new Date(apartment.lastCleaned);
    const today = new Date();
    const diffTime = Math.abs(today - lastCleaned);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceCleaning = getDaysSinceCleaning();

  // Kein Status mehr, nur Tage seit Reinigung anzeigen

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg" showHeader={false}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{apartment.name}</h2>
              <Badge status={currentStatus} size="sm" showIcon={true} />
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{apartment.address}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Zwei-Spalten-Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
          {/* Linke Spalte: Wohnungsdetails mit Kalender */}
          <div className="space-y-4 overflow-y-auto">
            {/* Beschreibung mit Hauptinformationen */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-700 text-sm">{apartment.description}</p>
                <button
                  onClick={() => setIsMainInfoCollapsed(!isMainInfoCollapsed)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title={isMainInfoCollapsed ? "Aufklappen" : "Einklappen"}
                >
                  {isMainInfoCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              {!isMainInfoCollapsed && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Hauptinformationen</h3>
                  <div className="space-y-4">
                    {/* Grunddaten */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Grunddaten</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Betten</div>
                            <div className="font-medium text-sm">{apartment.beds} Bett{apartment.beds > 1 ? 'en' : ''}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Preis pro Tag</div>
                            <div className="font-medium text-sm">€{apartment.price}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-xs text-gray-500">Status</div>
                            <Badge status={currentStatus} size="sm" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ausstattung */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Ausstattung</h4>
                      {apartment.amenities && apartment.amenities.length > 0 ? (
                        <div className="space-y-1">
                          {apartment.amenities.map((amenity, index) => {
                            const IconComponent = getAmenityIcon(amenity);
                            return (
                              <div key={index} className="flex items-center">
                                <IconComponent className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-700 text-sm">{amenity}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs">Keine besonderen Ausstattungsmerkmale</p>
                      )}
                    </div>

                    {/* Wartung & Reinigung */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Wartung & Reinigung</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500">Letzte Reinigung</div>
                            <div className="mt-0.5 flex items-center space-x-2">
                              <input
                                type="date"
                                defaultValue={apartment.lastCleaned}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  if (onUpdateApartment && newDate) {
                                    try {
                                      await onUpdateApartment(apartment.id, { lastCleaned: newDate });
                                      setShowSaved(true);
                                      setTimeout(() => setShowSaved(false), 3000);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                              />
                              {showSaved && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Reinigung vor {daysSinceCleaning} Tag{daysSinceCleaning !== 1 ? 'en' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <div className="text-xs text-gray-500">Nächste Reinigung</div>
                            <div className="mt-0.5 flex items-center space-x-2">
                              <input
                                type="date"
                                defaultValue={apartment.nextCleaning}
                                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                onChange={async (e) => {
                                  const newDate = e.target.value;
                                  if (onUpdateApartment && newDate) {
                                    try {
                                      await onUpdateApartment(apartment.id, { nextCleaning: newDate });
                                      setShowSavedMaintenance(true);
                                      setTimeout(() => setShowSavedMaintenance(false), 3000);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                }}
                              />
                              {showSavedMaintenance && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Belegungskalender */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 text-sm">Belegungskalender</h4>
              <MiniCalendar 
                key={`${apartment.id}-${bookings.length}`}
                apartment={apartment} 
                size="medium"
                bookings={bookings}
                onDateRangeSelect={(dateRange) => {
                  // Öffne das Buchungsformular mit den ausgewählten Daten
                  const startDate = dateRange.startDate.toISOString().split('T')[0];
                  const endDate = dateRange.endDate.toISOString().split('T')[0];
                  
                  // Finde die BookingList-Komponente und öffne das Formular
                  // Da wir in der ApartmentDetail sind, müssen wir das über die BookingList machen
                  // Wir können einen Event oder State verwenden, um das Formular zu öffnen
                  const event = new CustomEvent('openBookingForm', {
                    detail: { startDate, endDate }
                  });
                  window.dispatchEvent(event);
                }}
              />
            </div>
          </div>

          {/* Rechte Spalte: Buchungsübersicht */}
          <div className="flex flex-col overflow-hidden">
            <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
              <BookingList
                apartment={apartment}
                bookings={bookings}
                onAddBooking={onAddBooking}
                onUpdateBooking={onUpdateBooking}
                onDeleteBooking={onDeleteBooking}
              />
            </div>
          </div>
        </div>

        {/* Aktionen */}
        <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Schließen
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApartmentDetail;