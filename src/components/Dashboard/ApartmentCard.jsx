import { useState, useRef } from 'react';
import { Bed, MapPin, Euro, Calendar, Wifi, Car, Home, TreePine, Trees, WashingMachine, Clock, Star, Edit, Trash2 } from 'lucide-react';
import Badge from '../UI/Badge';
import MiniCalendar from './MiniCalendar';
import BookingFormFlip from '../Booking/BookingFormFlip';
import { STATUS_COLORS, FEATURE_ICONS } from '../../utils/constants';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';
import { useDeleteTooltip } from '../UI/DeleteTooltip';

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

// Apartment-Karten-Komponente
const ApartmentCard = ({ apartment, onClick, onEdit, onDelete }) => {
  const { getApartmentCurrentStatus, addBooking, bookings } = useApartments();
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const { showTooltip, TooltipComponent } = useDeleteTooltip();
  const cardRef = useRef(null);
  const deleteButtonRef = useRef(null);
  
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

  // Handler für Action-Buttons
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit && onEdit(apartment);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    showTooltip(
      `"${apartment.name}" löschen?`,
      () => onDelete && onDelete(apartment.id)
    );
  };

  // Handler für Datumsauswahl im Kalender
  const handleDateRangeSelect = (dateRange) => {
    setSelectedDateRange(dateRange);
    setIsFlipped(true);
  };

  // Handler für Buchungsformular
  const handleBookingSubmit = async (bookingData) => {
    try {
      await addBooking(bookingData);
      setIsFlipped(false);
      setSelectedDateRange(null);
      // Optional: Erfolgsmeldung anzeigen
      console.log('Buchung erfolgreich hinzugefügt:', bookingData);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Buchung:', error);
    }
  };

  const handleBookingFormClose = () => {
    setIsFlipped(false);
    setSelectedDateRange(null);
  };

  return (
    <div
      ref={cardRef}
      className={`flip-card ${isFlipped ? 'flipped' : ''} h-full relative`}
    >
      <div className="flip-card-inner h-full">
        {/* Vorderseite - Normale Karte */}
        <div
          className={`flip-card-front ${statusConfig.bg} ${statusConfig.border} border-2 p-4 cursor-pointer transition-all duration-200 group ${
            isFlipped ? '' : 'hover:shadow-xl hover:shadow-blue-200/50'
          }`}
          onClick={!isFlipped ? onClick : undefined}
        >
          {/* Action Buttons - erscheinen beim Hover */}
          <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 flex space-x-1 ${
            isFlipped ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <button
              onClick={handleEditClick}
              className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="Bearbeiten"
            >
              <Edit className="h-4 w-4 text-blue-600" />
            </button>
            <button
              ref={deleteButtonRef}
              onClick={handleDeleteClick}
              className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="Löschen"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>

          {/* Status-Badge in linker oberer Ecke */}
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <Badge status={currentStatus} className="whitespace-nowrap" />
          </div>

          {/* Header mit Name */}
          <div className="flex items-start justify-between mb-3 pr-16 pl-16 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                {apartment.name}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">{apartment.address}</span>
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {apartment.description}
          </p>

          {/* Details */}
          <div className="space-y-2">
            {/* Betten und Preis */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Bed className="h-4 w-4 mr-1" />
                <span className="text-sm">{apartment.beds} Bett{apartment.beds > 1 ? 'en' : ''}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Euro className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{apartment.price}/Tag</span>
              </div>
            </div>

            {/* Amenities mit Icons */}
            {apartment.amenities && apartment.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {apartment.amenities.slice(0, 3).map((amenity, index) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                      title={amenity}
                    >
                      <IconComponent className="h-3 w-3 mr-1" />
                      {amenity}
                    </span>
                  );
                })}
                {apartment.amenities.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    +{apartment.amenities.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Wartungsinfo */}
            {currentStatus === 'wartung' && (
              <div className="flex items-center text-yellow-700 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Wartung heute</span>
              </div>
            )}

            {/* Reinigungsinfo (ohne Fälligkeits-Hinweis) */}
            <div className="flex items-center text-xs">
              <div className="flex items-center text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Gereinigt vor {daysSinceCleaning} Tag{daysSinceCleaning !== 1 ? 'en' : ''}</span>
              </div>
            </div>
          </div>

          {/* Mini-Kalender */}
          <div 
            className="mt-3 pt-3 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs text-gray-500 mb-2 text-center">
              Belegungskalender
            </div>
            <MiniCalendar 
              key={`${apartment.id}-${bookings.length}`}
              apartment={apartment} 
              size="small" 
              onDateRangeSelect={handleDateRangeSelect}
              bookings={bookings}
            />
          </div>
        </div>

        {/* Rückseite - Buchungsformular */}
        <div className="flip-card-back bg-white border-2 border-blue-300 p-4">
          <BookingFormFlip
            apartment={apartment}
            selectedDateRange={selectedDateRange}
            onSubmit={handleBookingSubmit}
            onClose={handleBookingFormClose}
          />
        </div>
      </div>
      
      {/* Tooltip Overlay */}
      <TooltipComponent />
    </div>
  );
};

export default ApartmentCard;