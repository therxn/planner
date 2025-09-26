import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarLegend from './CalendarLegend';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';
import { formatDateToISO } from '../../utils/dateUtils';

// Mini-Kalender Komponente für Wohnungskarten
// Optional: vorgefilterte Buchungen übergeben, um externe Aktualisierungen zu spiegeln
const MiniCalendar = ({ apartment, size = 'small', onDateRangeSelect = null, bookings: bookingsProp = null }) => {
  const { bookings: hookBookings } = useApartments();
  const bookings = bookingsProp || hookBookings;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  
  // Bestimme Belegungsstatus für einen Tag basierend auf echten Buchungen
  const getDayStatus = (date) => {
    // Verwende lokales Datum ohne Zeitzone-Probleme
    const dateStr = formatDateToISO(date);
    
    // Prüfe alle Buchungen für diese Wohnung an diesem Datum
    const apartmentBookings = bookings.filter(booking => 
      booking.apartmentId === apartment.id &&
      dateStr >= booking.startDate && 
      dateStr <= booking.endDate
    );
    
    if (apartmentBookings.length > 0) {
      // Prüfe ob es eine Wartungsbuchung ist
      const maintenanceBooking = apartmentBookings.find(booking => 
        booking.title.toLowerCase().includes('wartung') || 
        booking.company.toLowerCase().includes('wartung') ||
        booking.company.toLowerCase().includes('hausmeister')
      );
      
      if (maintenanceBooking) {
        return 'maintenance';
      }
      
      return 'occupied';
    }
    
    // Keine Buchung = frei
    return 'free';
  };

  // Kalender-Grid generieren
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const status = getDayStatus(date);
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        status
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-200 border-red-300';
      case 'maintenance':
        return 'bg-yellow-200 border-yellow-300';
      case 'free':
      default:
        return 'bg-green-200 border-green-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'occupied':
        return 'Belegt';
      case 'maintenance':
        return 'Wartung';
      case 'free':
      default:
        return 'Frei';
    }
  };

  // Prüfe ob ein Datum in der ausgewählten Range liegt
  const isDateInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  // Prüfe ob ein Datum zwischen Start- und Enddatum liegt (für visuelle Range)
  const isDateInSelectedRange = (date) => {
    if (!selectedStartDate || selectedEndDate) return false;
    return date >= selectedStartDate;
  };

  // Prüfe ob ein Datum das Start- oder Enddatum ist
  const isDateSelected = (date) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    return (selectedStartDate && date.getTime() === selectedStartDate.getTime()) ||
           (selectedEndDate && date.getTime() === selectedEndDate.getTime());
  };

  // Prüfe ob ein Datum bereits belegt ist
  const isDateOccupied = (date) => {
    const status = getDayStatus(date);
    return status === 'occupied' || status === 'maintenance';
  };

  // Datum-Klick-Handler
  const handleDateClick = (date) => {
    if (!onDateRangeSelect) return; // Nur wenn Callback vorhanden ist
    
    // Prüfe ob Datum bereits belegt ist
    if (isDateOccupied(date)) {
      return; // Belegte Tage können nicht ausgewählt werden
    }

    // Prüfe ob Datum in der Vergangenheit liegt
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return; // Vergangene Tage können nicht ausgewählt werden
    }

    if (!selectedStartDate) {
      // Erste Auswahl - Startdatum setzen
      setSelectedStartDate(date);
      setIsSelectingRange(true);
    } else if (!selectedEndDate) {
      // Zweite Auswahl - Enddatum setzen
      if (date < selectedStartDate) {
        // Wenn das zweite Datum vor dem ersten liegt, tausche sie
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(date);
      } else {
        setSelectedEndDate(date);
      }
      
      // Prüfe ob der Bereich gültig ist und öffne Buchungsformular
      if (onDateRangeSelect) {
        onDateRangeSelect({
          startDate: date < selectedStartDate ? date : selectedStartDate,
          endDate: date < selectedStartDate ? selectedStartDate : date
        });
      }
      
      // Reset für nächste Auswahl
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setIsSelectingRange(false);
    }
  };

  // Auswahl zurücksetzen
  const resetSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsSelectingRange(false);
  };

  if (size === 'small') {
    return (
      <div className="bg-white rounded-lg border p-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
          <span className="text-xs font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs text-gray-500 text-center p-1">
              {day}
            </div>
          ))}
        </div>

        {/* Kalendertage */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isSelected = isDateSelected(day.date);
            const isInRange = isDateInRange(day.date);
            const isInSelectedRange = isDateInSelectedRange(day.date);
            const isOccupied = isDateOccupied(day.date);
            const isPast = day.date < new Date().setHours(0, 0, 0, 0);
            const isClickable = onDateRangeSelect && day.isCurrentMonth && !isOccupied && !isPast;
            
            return (
              <div
                key={index}
                className={`
                  text-xs p-1 text-center rounded transition-all duration-200
                  ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-700'}
                  ${day.isToday ? 'bg-blue-100 font-bold border-2 border-blue-300' : ''}
                  ${day.isCurrentMonth ? getStatusColor(day.status) : ''}
                  ${isSelected ? 'bg-blue-500 text-white font-bold border-2 border-blue-600' : ''}
                  ${isInRange && !isSelected ? 'bg-blue-200 border border-blue-300' : ''}
                  ${isInSelectedRange && !isSelected && !isInRange ? 'bg-blue-100 border border-blue-200' : ''}
                  ${isClickable ? 'cursor-pointer hover:bg-opacity-80 hover:scale-105' : 'cursor-default'}
                  ${isOccupied ? 'opacity-60 cursor-not-allowed' : ''}
                  ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                `}
                title={`${day.date.toLocaleDateString('de-DE')}: ${getStatusText(day.status)}${isOccupied ? ' (nicht verfügbar)' : ''}${isPast ? ' (vergangen)' : ''}`}
                onClick={() => isClickable && handleDateClick(day.date)}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>

        {/* Anleitung für Datumsauswahl */}
        {onDateRangeSelect && (
          <div className="mt-2 text-center">
            {!isSelectingRange ? (
              <div className="text-xs text-gray-500">
                Klicken Sie auf ein freies Datum zum Buchen
              </div>
            ) : (
              <div className="text-xs text-blue-600 font-medium">
                Wählen Sie das Enddatum
              </div>
            )}
          </div>
        )}

        {/* Legende */}
        <div className="mt-2">
          <CalendarLegend size="small" />
        </div>
      </div>
    );
  }

  // Mittlere Version für Detail-Ansicht
  if (size === 'medium') {
    return (
      <div className="bg-white rounded-lg border p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-base font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Wochentage */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-600 text-center p-1">
              {day}
            </div>
          ))}
        </div>

        {/* Kalendertage */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const isSelected = isDateSelected(day.date);
            const isInRange = isDateInRange(day.date);
            const isInSelectedRange = isDateInSelectedRange(day.date);
            const isOccupied = isDateOccupied(day.date);
            const isPast = day.date < new Date().setHours(0, 0, 0, 0);
            const isClickable = onDateRangeSelect && day.isCurrentMonth && !isOccupied && !isPast;
            
            return (
              <div
                key={index}
                className={`
                  text-sm p-1.5 text-center rounded border transition-all duration-200
                  ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-700'}
                  ${day.isToday ? 'bg-blue-100 font-bold border-blue-300' : ''}
                  ${day.isCurrentMonth ? getStatusColor(day.status) : ''}
                  ${isSelected ? 'bg-blue-500 text-white font-bold border-2 border-blue-600' : ''}
                  ${isInRange && !isSelected ? 'bg-blue-200 border border-blue-300' : ''}
                  ${isInSelectedRange && !isSelected && !isInRange ? 'bg-blue-100 border border-blue-200' : ''}
                  ${isClickable ? 'cursor-pointer hover:bg-opacity-80 hover:scale-105' : 'cursor-default'}
                  ${isOccupied ? 'opacity-60 cursor-not-allowed' : ''}
                  ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
                `}
                title={`${day.date.toLocaleDateString('de-DE')}: ${getStatusText(day.status)}${isOccupied ? ' (nicht verfügbar)' : ''}${isPast ? ' (vergangen)' : ''}`}
                onClick={() => isClickable && handleDateClick(day.date)}
              >
                {day.date.getDate()}
              </div>
            );
          })}
        </div>

        {/* Anleitung für Datumsauswahl */}
        {onDateRangeSelect && (
          <div className="mt-3 text-center">
            {!isSelectingRange ? (
              <div className="text-xs text-gray-500">
                Klicken Sie auf ein freies Datum zum Buchen
              </div>
            ) : (
              <div className="text-xs text-blue-600 font-medium">
                Wählen Sie das Enddatum
              </div>
            )}
          </div>
        )}

        {/* Legende */}
        <div className="mt-3">
          <CalendarLegend size="small" />
        </div>
      </div>
    );
  }

  // Größere Version für Detail-Ansicht
  if (size === 'large') {
    return (
    <div className="bg-white rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Wochentage */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'].map(day => (
          <div key={day} className="text-sm font-medium text-gray-600 text-center p-2">
            {day.substring(0, 2)}
          </div>
        ))}
      </div>

      {/* Kalendertage */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const isSelected = isDateSelected(day.date);
          const isInRange = isDateInRange(day.date);
          const isInSelectedRange = isDateInSelectedRange(day.date);
          const isOccupied = isDateOccupied(day.date);
          const isPast = day.date < new Date().setHours(0, 0, 0, 0);
          const isClickable = onDateRangeSelect && day.isCurrentMonth && !isOccupied && !isPast;
          
          return (
            <div
              key={index}
              className={`
                text-sm p-2 text-center rounded-lg border transition-all duration-200
                ${!day.isCurrentMonth ? 'text-gray-300 bg-gray-50' : 'text-gray-700'}
                ${day.isToday ? 'bg-blue-100 font-bold border-blue-300' : ''}
                ${day.isCurrentMonth ? getStatusColor(day.status) : ''}
                ${isSelected ? 'bg-blue-500 text-white font-bold border-2 border-blue-600' : ''}
                ${isInRange && !isSelected ? 'bg-blue-200 border border-blue-300' : ''}
                ${isInSelectedRange && !isSelected && !isInRange ? 'bg-blue-100 border border-blue-200' : ''}
                ${isClickable ? 'cursor-pointer hover:bg-opacity-80 hover:scale-105' : 'cursor-default'}
                ${isOccupied ? 'opacity-60 cursor-not-allowed' : ''}
                ${isPast ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              title={`${day.date.toLocaleDateString('de-DE')}: ${getStatusText(day.status)}${isOccupied ? ' (nicht verfügbar)' : ''}${isPast ? ' (vergangen)' : ''}`}
              onClick={() => isClickable && handleDateClick(day.date)}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>

      {/* Anleitung für Datumsauswahl */}
      {onDateRangeSelect && (
        <div className="mt-4 text-center">
          {!isSelectingRange ? (
            <div className="text-sm text-gray-500">
              Klicken Sie auf ein freies Datum zum Buchen
            </div>
          ) : (
            <div className="text-sm text-blue-600 font-medium">
              Wählen Sie das Enddatum
            </div>
          )}
        </div>
      )}

      {/* Legende */}
      <div className="mt-4">
        <CalendarLegend size="large" />
      </div>
    </div>
    );
  }

  // Fallback für unbekannte Größen
  return null;
};

export default MiniCalendar;