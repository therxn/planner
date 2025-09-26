import { useState, useRef } from 'react';
import { Bed, MapPin, Euro, Calendar, Clock, Edit, Trash2, Star } from 'lucide-react';
import Badge from '../UI/Badge';
import MiniCalendar from './MiniCalendar';
import BookingFormFlip from '../Booking/BookingFormFlip';
import { STATUS_COLORS } from '../../utils/constants';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';
import { useDeleteTooltip } from '../UI/DeleteTooltip';

// Kompakte Apartment-Karten-Komponente für kleinere Grid-Ansicht
const ApartmentCardCompact = ({ apartment, onClick, onEdit, onDelete }) => {
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
    showTooltip(e, deleteButtonRef.current);
  };

  const handleDeleteConfirm = () => {
    onDelete && onDelete(apartment.id);
  };

  // Buchung hinzufügen
  const handleAddBooking = async (bookingData) => {
    try {
      await addBooking(bookingData);
      setIsFlipped(false);
      setSelectedDateRange(null);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Buchung:', error);
    }
  };

  // Kalender-Datum auswählen
  const handleDateSelect = (dateRange) => {
    setSelectedDateRange(dateRange);
    setIsFlipped(true);
  };

  // Karte umdrehen
  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <>
      <div
        ref={cardRef}
        className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 relative group h-[28rem] ${isFlipped ? 'flip-card-flipped' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Vorderseite - Kompakte Ansicht */}
        <div className="flip-card-front h-full p-4 flex flex-col">
          {/* Header mit Name und Status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-base truncate">
                {apartment.name}
              </h3>
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{apartment.address}</span>
              </div>
            </div>
            <Badge status={currentStatus} />
          </div>

          {/* Hauptinfo - Betten und Preis */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-gray-600 text-sm">
              <Bed className="h-4 w-4 mr-1" />
              <span className="font-medium">{apartment.beds} Bett{apartment.beds > 1 ? 'en' : ''}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Euro className="h-4 w-4 mr-1" />
              <span className="font-medium">{apartment.price}/Tag</span>
            </div>
          </div>

          {/* Letzte Reinigung */}
          <div className="flex items-center text-gray-600 text-xs mb-3">
            <Clock className="h-3 w-3 mr-1" />
            <span>Reinigung: {daysSinceCleaning} Tag{daysSinceCleaning !== 1 ? 'e' : ''} her</span>
          </div>

          {/* Kompakter Mini-Kalender integriert */}
          <div className="flex-1 mb-3">
            <MiniCalendar
              apartment={apartment}
              bookings={bookings.filter(b => b.apartmentId === apartment.id)}
              onDateSelect={handleDateSelect}
              compact={true}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleFlip}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Buchung hinzufügen
            </button>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleEditClick}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="Bearbeiten"
              >
                <Edit className="h-3 w-3 text-blue-600" />
              </button>
              <button
                ref={deleteButtonRef}
                onClick={handleDeleteClick}
                className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="Löschen"
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Rückseite - Buchungsformular */}
        <div className="flip-card-back h-full">
          <BookingFormFlip
            apartment={apartment}
            selectedDateRange={selectedDateRange}
            onSubmit={handleAddBooking}
            onClose={() => setIsFlipped(false)}
          />
        </div>
      </div>

      {/* Delete Tooltip */}
      <TooltipComponent onConfirm={handleDeleteConfirm} />
    </>
  );
};

export default ApartmentCardCompact;