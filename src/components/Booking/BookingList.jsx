import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';
import { bookingUtils, bookingStatusConfig } from '../../data/bookingData';
import BookingForm from './BookingForm';
import { useDeleteTooltip } from '../UI/DeleteTooltip';

// Buchungsliste für Wohnungsdetails
const BookingList = ({ 
  apartment, 
  bookings, 
  onAddBooking, 
  onUpdateBooking, 
  onDeleteBooking 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [preSelectedDates, setPreSelectedDates] = useState(null);
  const { showTooltip, TooltipComponent } = useDeleteTooltip();

  // Event Listener für Kalender-Klicks
  useEffect(() => {
    const handleOpenBookingForm = (event) => {
      const { startDate, endDate } = event.detail;
      setPreSelectedDates({ startDate, endDate });
      setIsFormOpen(true);
    };

    window.addEventListener('openBookingForm', handleOpenBookingForm);
    
    return () => {
      window.removeEventListener('openBookingForm', handleOpenBookingForm);
    };
  }, []);

  // Buchungen nach Datum sortieren
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );

  // Aufteilen in vergangene, aktuelle und kommende Buchungen
  const todayStr = new Date().toISOString().split('T')[0];
  const pastBookings = [...sortedBookings]
    .filter(b => b.endDate < todayStr)
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate)); // Neueste vergangene zuerst
  const activeBookings = sortedBookings.filter(b => b.startDate <= todayStr && b.endDate >= todayStr);
  const upcomingBookings = sortedBookings.filter(b => b.startDate > todayStr);

  // Navigation für History und kommende Buchungen
  const [pastIndex, setPastIndex] = useState(0);
  const [upcomingIndex, setUpcomingIndex] = useState(0);
  const currentBooking = activeBookings[0] || null;

  const stepPast = (delta) => {
    if (pastBookings.length === 0) return;
    setPastIndex(prev => {
      const next = (prev + delta + pastBookings.length) % pastBookings.length;
      return next;
    });
  };

  const stepUpcoming = (delta) => {
    if (upcomingBookings.length === 0) return;
    setUpcomingIndex(prev => {
      const next = (prev + delta + upcomingBookings.length) % upcomingBookings.length;
      return next;
    });
  };

  // Index anpassen, wenn durch Löschung die Anzahl schrumpft
  useEffect(() => {
    if (upcomingBookings.length === 0) {
      setUpcomingIndex(0);
    } else if (upcomingIndex > upcomingBookings.length - 1) {
      setUpcomingIndex(upcomingBookings.length - 1);
    }
  }, [upcomingBookings.length]);

  // Formular schließen
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBooking(null);
    setPreSelectedDates(null);
  };

  // Formular submit
  const handleFormSubmit = (bookingData) => {
    console.log('BookingForm submit:', bookingData);
    if (editingBooking) {
      onUpdateBooking(editingBooking.id, bookingData);
    } else {
      onAddBooking(bookingData);
    }
    handleFormClose();
  };

  // Buchung bearbeiten
  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setIsFormOpen(true);
  };

  // Status-Badge
  const StatusBadge = ({ status }) => {
    const config = bookingStatusConfig[status] || bookingStatusConfig.upcoming;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  // Buchungskarte
  // Detaillierte Liste entfernt

  // Kompakte Karte für Schnellansicht
  const BookingCardMini = ({ booking, label, highlight=false, onDelete, onEdit }) => {
    if (!booking) {
      return (
        <div className="border rounded-lg p-3 bg-gray-50 text-xs text-gray-500 text-center">
          {label}: Keine
        </div>
      );
    }
    const duration = bookingUtils.getBookingDuration(booking);
    let customBadgeText;
    let customBadgeClasses;

    if (label === 'Aktuell') {
      customBadgeText = 'Aktuell';
      customBadgeClasses = 'bg-blue-100 text-blue-800';
    } else if (label === 'Nächste') {
      // Für "Nächste" den echten Buchungsstatus verwenden
      customBadgeText = bookingStatusConfig[booking.status]?.label || 'Status';
      customBadgeClasses = bookingStatusConfig[booking.status]?.bgColor + ' ' + bookingStatusConfig[booking.status]?.textColor;
    } else {
      // Vergangene Buchungen
      customBadgeText = 'Beendet';
      customBadgeClasses = 'bg-gray-100 text-gray-700';
    }

    return (
      <div className={`border rounded-lg p-3 text-xs relative shadow-sm ${
        label === 'Aktuell' ? 'bg-blue-50 border-blue-200' : 
        label === 'Nächste' ? 'bg-green-50 border-green-200' : 
        'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full font-medium text-xs ${customBadgeClasses}`}>
              {customBadgeText}
            </span>
            <div className="text-gray-900 font-semibold text-base">{booking.title}</div>
          </div>
          {(label === 'Aktuell' || label === 'Nächste') && (
            <div className="flex space-x-1">
              <button
                title="Buchung bearbeiten"
                className="p-1 rounded hover:bg-blue-100 hover:text-blue-600 text-gray-500 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit(booking);
                  }
                }}
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                title="Buchung entfernen"
                className="p-1 rounded hover:bg-red-100 hover:text-red-600 text-gray-500 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) {
                    showTooltip(`Buchung "${booking.title}" löschen?`, () => onDelete());
                  }
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
        
        <div className="space-y-1.5">
          {booking.guestName && (
            <div className="text-gray-600 text-sm">
              <span className="font-medium">Gast:</span> {booking.guestName}
            </div>
          )}
          {booking.company && (
            <div className="text-gray-600 text-sm">{booking.company}</div>
          )}
          
          {/* Erste Zeile: Datum, Dauer und Preis nebeneinander */}
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1.5" />
              <span className="text-sm">{bookingUtils.formatDate(booking.startDate)} - {bookingUtils.formatDate(booking.endDate)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1.5" />
                <span className="text-sm">{duration} Tag{duration > 1 ? 'e' : ''}</span>
              </div>
              {booking.pricePerNight && (
                <div className="text-sm font-medium text-gray-900">
                  €{booking.pricePerNight}/Tag
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, count, disable, onPrev, onNext }) => (
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-gray-800">{title}{typeof count === 'string' && ` • ${count}`}</span>
      <div className="flex items-center">
        <button
          onClick={onPrev}
          className={`p-1 rounded ${disable ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Vorherige"
          disabled={disable}
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={onNext}
          className={`p-1 rounded ${disable ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          title="Nächste"
          disabled={disable}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
    </div>
  );

  const upcomingCountLabel = upcomingBookings.length > 0 ? `${upcomingIndex + 1}/${upcomingBookings.length}` : '0/0';
  const pastCountLabel = pastBookings.length > 0 ? `${pastIndex + 1}/${pastBookings.length}` : '0/0';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Buchungsübersicht
        </h3>
        <button
          onClick={() => {
            // Start-/Enddatum vorbefüllen: heute und morgen
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            setPreSelectedDates({ startDate: fmt(today), endDate: fmt(tomorrow) });
            setIsFormOpen(true);
          }}
          className="flex items-center px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          <Plus className="h-3 w-3 mr-1" />
          Neue Buchung
        </button>
      </div>

      {/* Inhalt: Entweder Übersicht oder Formular */}
      <div className="flex-1 overflow-y-auto">
        {isFormOpen ? (
          <BookingForm
            apartment={apartment}
            isOpen={isFormOpen}
            onClose={handleFormClose}
            onSubmit={handleFormSubmit}
            editingBooking={editingBooking}
            embedded={true}
            preSelectedDates={preSelectedDates}
          />
        ) : (
          <div className="space-y-3">
            {/* 1) Aktuelle Buchung */}
            <div>
              <SectionHeader title="Aktuelle Buchung" disable={true} />
              <BookingCardMini 
                booking={currentBooking} 
                label="Aktuell" 
                highlight={true}
                onEdit={currentBooking ? () => handleEditBooking(currentBooking) : undefined}
                onDelete={currentBooking ? () => onDeleteBooking(currentBooking.id) : undefined}
              />
            </div>

            {/* 2) Nächste Buchung mit Navigation */}
            <div>
              <SectionHeader
                title="Nächste Buchung"
                count={upcomingCountLabel}
                disable={upcomingBookings.length <= 1}
                onPrev={() => stepUpcoming(-1)}
                onNext={() => stepUpcoming(1)}
              />
              <BookingCardMini 
                booking={upcomingBookings[upcomingIndex]} 
                label="Nächste" 
                highlight={true}
                onEdit={upcomingBookings[upcomingIndex] ? () => handleEditBooking(upcomingBookings[upcomingIndex]) : undefined}
                onDelete={upcomingBookings[upcomingIndex] ? () => onDeleteBooking(upcomingBookings[upcomingIndex].id) : undefined}
              />
            </div>

            {/* 3) Vergangene Buchungen (jüngste zuerst) */}
            <div>
              <SectionHeader
                title="Vergangene Buchungen"
                count={pastCountLabel}
                disable={pastBookings.length <= 1}
                onPrev={() => stepPast(-1)}
                onNext={() => stepPast(1)}
              />
              <BookingCardMini booking={pastBookings[pastIndex]} label="Zuletzt beendet" />
            </div>
          </div>
        )}
      </div>
      <TooltipComponent />
    </div>
  );
};

export default BookingList;