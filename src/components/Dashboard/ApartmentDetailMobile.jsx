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
  ArrowLeft,
  Check
} from 'lucide-react';
import Drawer from '../UI/Drawer';
import Badge from '../UI/Badge';
import MiniCalendar from './MiniCalendar';
import BookingList from '../Booking/BookingList';
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

// Mobile-optimierte Apartment-Detail-Komponente
const ApartmentDetailMobile = ({ 
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
  const { bookings: allBookings, getApartmentCurrentStatus } = useApartments();
  const [showSaved, setShowSaved] = useState(false);
  const [showSavedMaintenance, setShowSavedMaintenance] = useState(false);
  
  if (!apartment) return null;

  // Verwende aktuellen Status basierend auf Buchungen
  const currentStatus = getApartmentCurrentStatus(apartment);

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
    <Drawer isOpen={isOpen} onClose={onClose} title={apartment.name}>
      <div className="space-y-6">
        {/* Header mit Status */}
        <div className="flex items-center justify-between">
          <Badge status={currentStatus} size="md" showIcon={true} />
        </div>

        {/* Adresse */}
        <div className="flex items-center text-gray-600">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{apartment.address}</span>
        </div>

        {/* Beschreibung */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700">{apartment.description}</p>
        </div>

        {/* Grunddaten */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Grunddaten</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Bed className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Betten</span>
              </div>
              <div className="font-semibold text-lg">{apartment.beds}</div>
            </div>
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Euro className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Preis/Tag</span>
              </div>
              <div className="font-semibold text-lg">€{apartment.price}</div>
            </div>
          </div>
        </div>

        {/* Ausstattung */}
        {apartment.amenities && apartment.amenities.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Ausstattung</h3>
            <div className="grid grid-cols-2 gap-2">
              {apartment.amenities.map((amenity, index) => {
                const IconComponent = getAmenityIcon(amenity);
                return (
                  <div key={index} className="flex items-center bg-white border rounded-lg p-3">
                    <IconComponent className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Wartung & Reinigung */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Wartung & Reinigung</h3>
          <div className="space-y-3">
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Letzte Reinigung</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  defaultValue={apartment.lastCleaned}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
            <div className="bg-white border rounded-lg p-3">
              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Nächste Reinigung</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  defaultValue={apartment.nextCleaning}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

        {/* Reinigungsfortschritt entfernt */}

        {/* Buchungsliste */}
        <div className="bg-gray-50 rounded-lg p-4">
          <BookingList
            apartment={apartment}
            bookings={bookings}
            onAddBooking={onAddBooking}
            onUpdateBooking={onUpdateBooking}
            onDeleteBooking={onDeleteBooking}
          />
        </div>

        {/* Belegungskalender */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Belegungskalender</h4>
          <MiniCalendar 
            key={`${apartment.id}-${allBookings.length}`}
            apartment={apartment} 
            size="large" 
          />
        </div>

        {/* Aktionen */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Schließen
          </button>
        </div>
      </div>
    </Drawer>
  );
};

export default ApartmentDetailMobile;