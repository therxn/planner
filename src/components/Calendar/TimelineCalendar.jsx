import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Building } from 'lucide-react';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';
import { bookingUtils } from '../../data/bookingData';
import CalendarLegend from './CalendarLegend';
import ApartmentDetailResponsive from '../Dashboard/ApartmentDetailResponsive';

// Timeline-Kalender für alle Wohnungen
const TimelineCalendar = () => {
  const { allApartments, bookings, updateBooking, getActiveBookingsForDate } = useApartments();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // week, month
  const [hoveredTooltip, setHoveredTooltip] = useState(null); // { apartment, day, booking, x, y }
  const scrollContainerRef = useRef(null);
  const [dragState, setDragState] = useState(null); // { type: 'move'|'resize-start'|'resize-end', bookingId, originalStart, originalEnd, startClientX, lastEdgeSwitchAt }
  const [selectedApartment, setSelectedApartment] = useState(null); // Für ApartmentDetail
  const [isApartmentDetailOpen, setIsApartmentDetailOpen] = useState(false);

  // Generiere Zeitstrahl-Daten
  const timelineData = useMemo(() => {
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      // Starte am Montag der aktuellen Woche
      startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      // Monatsansicht
      startDate.setDate(1);
      endDate.setMonth(currentDate.getMonth() + 1, 0);
    }

    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return {
      startDate,
      endDate,
      days
    };
  }, [currentDate, viewMode]);

  // Helper
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const diffInDays = (a, b) => {
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    const ms = end - start;
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };

  const clampDateToRange = (date, start, end) => {
    if (date < start) return new Date(start);
    if (date > end) return new Date(end);
    return new Date(date);
  };

  const getTotalDaysInView = () => {
    return diffInDays(timelineData.startDate, timelineData.endDate) + 1;
  };

  const getDayWidthPx = (container) => {
    if (!container) return 0;
    const totalDays = getTotalDaysInView();
    const width = container.getBoundingClientRect().width;
    return width / totalDays;
  };

  const calculateNewDatesFromDrag = (apartmentId, booking, container, clientX, type, original) => {
    if (!container) return null;
    const dayWidth = getDayWidthPx(container);
    if (!dayWidth) return null;
    const deltaPx = clientX - dragState.startClientX;
    const deltaDays = Math.round(deltaPx / dayWidth);

    const origStart = new Date(original.originalStart);
    const origEnd = new Date(original.originalEnd);

    let newStart = new Date(origStart);
    let newEnd = new Date(origEnd);

    if (type === 'move') {
      newStart = addDays(origStart, deltaDays);
      newEnd = addDays(origEnd, deltaDays);
    } else if (type === 'resize-start') {
      newStart = addDays(origStart, deltaDays);
      if (newStart > newEnd) newStart = new Date(newEnd);
    } else if (type === 'resize-end') {
      newEnd = addDays(origEnd, deltaDays);
      if (newEnd < newStart) newEnd = new Date(newStart);
    }

    return { newStart, newEnd };
  };

  const checkOverlap = (apartmentId, bookingId, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return bookings.some(b => {
      if (b.apartmentId !== apartmentId) return false;
      if (b.id === bookingId) return false;
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return (start <= bEnd && end >= bStart);
    });
  };

  const getUpdatedTotalPrice = (booking, startDate, endDate) => {
    const duration = bookingUtils.getBookingDuration({ startDate, endDate });
    const price = Number(booking.pricePerNight) || 0;
    return duration * price;
  };

  // Während Drag am Rand automatisch die Ansicht wechseln (Monat/Woche vor/zurück)
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e) => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const edge = 24; // px Randbereich
      const now = Date.now();

      if (e.clientX > rect.right - edge) {
        if (!dragState.lastEdgeSwitchAt || now - dragState.lastEdgeSwitchAt > 500) {
          setDragState(prev => ({ ...prev, lastEdgeSwitchAt: now }));
          navigateTime(1);
        }
      } else if (e.clientX < rect.left + edge) {
        if (!dragState.lastEdgeSwitchAt || now - dragState.lastEdgeSwitchAt > 500) {
          setDragState(prev => ({ ...prev, lastEdgeSwitchAt: now }));
          navigateTime(-1);
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [dragState, viewMode, timelineData.startDate, timelineData.endDate]);

  // Globales Pointer-Handling für Drag/Resize
  useEffect(() => {
    if (!dragState) return;

    const handleMove = (e) => {
      e.preventDefault();
      // Nur für Vorschau zuständig; tatsächliche Vorschau berechnen wir on-the-fly in Render
      // Trigger Re-Render
      setDragState(prev => ({ ...prev, currentClientX: e.clientX }));
    };

    const handleUp = async (e) => {
      const container = scrollContainerRef.current;
      const booking = bookings.find(b => b.id === dragState.bookingId);
      if (booking && container) {
        const calc = calculateNewDatesFromDrag(
          booking.apartmentId,
          booking,
          container,
          dragState.currentClientX ?? dragState.startClientX,
          dragState.type,
          { originalStart: dragState.originalStart, originalEnd: dragState.originalEnd }
        );

        if (calc) {
          const newStartISO = calc.newStart.toISOString().split('T')[0];
          const newEndISO = calc.newEnd.toISOString().split('T')[0];

          if (checkOverlap(booking.apartmentId, booking.id, newStartISO, newEndISO)) {
            // Überschneidung – verwerfen
            // Optional: Feedback anzeigen
          } else {
            try {
              await updateBooking(booking.id, {
                startDate: newStartISO,
                endDate: newEndISO,
                totalPrice: getUpdatedTotalPrice(booking, newStartISO, newEndISO)
              });
            } catch (err) {
              // Fehler still behandeln oder anzeigen
              // console.error(err);
            }
          }
        }
      }
      setDragState(null);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragState, bookings]);

  // Bestimme Status für eine Wohnung an einem bestimmten Tag basierend auf echten Buchungen
  const getApartmentStatus = (apartment, date) => {
    // Prüfe alle Buchungen (nicht nur aktive) für dieses Datum
    const dateStr = date.toISOString().split('T')[0];
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

  // Hole Buchungsdetails für einen Tag
  const getBookingForDate = (apartment, date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.find(booking => 
      booking.apartmentId === apartment.id &&
      dateStr >= booking.startDate && 
      dateStr <= booking.endDate
    );
  };

  // Navigation
  const navigateTime = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + (direction * 7));
      } else {
        newDate.setMonth(prev.getMonth() + direction);
      }
      return newDate;
    });
  };

  // ApartmentDetail Handler
  const handleBookingClick = (booking) => {
    const apartment = allApartments.find(apt => apt.id === booking.apartmentId);
    setSelectedApartment(apartment);
    setIsApartmentDetailOpen(true);
  };

  const handleApartmentDetailClose = () => {
    setIsApartmentDetailOpen(false);
    setSelectedApartment(null);
  };

  // Handler für ApartmentDetail
  const handleEditApartment = (apartment) => {
    // Hier könntest du ein ApartmentForm öffnen
    console.log('Wohnung bearbeiten:', apartment);
  };

  const handleUpdateApartment = async (id, updates) => {
    try {
      // Hier könntest du die Wohnung aktualisieren
      console.log('Wohnung aktualisieren:', id, updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Wohnung:', error);
    }
  };

  const handleAddBooking = async (bookingData) => {
    try {
      // Hier könntest du eine neue Buchung hinzufügen
      console.log('Neue Buchung hinzufügen:', bookingData);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Buchung:', error);
    }
  };

  const handleUpdateBooking = async (id, updates) => {
    try {
      await updateBooking(id, updates);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Buchung:', error);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      // Hier könntest du die Buchung löschen
      console.log('Buchung löschen:', id);
    } catch (error) {
      console.error('Fehler beim Löschen der Buchung:', error);
    }
  };

  // Status-Farben
  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'free':
      default:
        return 'bg-green-500';
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

  // Heute markieren
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header mit Navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Belegungskalender</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monat
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Woche
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateTime(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center min-w-[200px]">
                <div className="text-lg font-semibold text-gray-900">
                  {viewMode === 'week' 
                    ? `Woche ${Math.ceil(timelineData.startDate.getDate() / 7)}`
                    : currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {timelineData.startDate.toLocaleDateString('de-DE')} - {timelineData.endDate.toLocaleDateString('de-DE')}
                </div>
              </div>
              
              <button
                onClick={() => navigateTime(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Statistiken entfernt */}
      </div>

      {/* Timeline Tabelle */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto" ref={scrollContainerRef}>
          <table className="w-full">
            {/* Header mit Datum */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 min-w-[200px]">
                  <Building className="h-4 w-4 inline mr-2" />
                  Wohnung
                </th>
                <th className="px-0 py-3 text-center text-sm font-medium text-gray-900" colSpan={timelineData.days.length}>
                  <div className="flex items-center justify-center space-x-4">
                    <span className="text-gray-600">
                      {timelineData.startDate.toLocaleDateString('de-DE')} - {timelineData.endDate.toLocaleDateString('de-DE')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Frei</span>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Belegt</span>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs text-gray-600">Wartung</span>
                    </div>
                  </div>
                </th>
              </tr>
              
              {/* Datum-Zeile */}
              <tr>
                <th className="px-4 py-2"></th>
                <th className="px-0 py-2" colSpan={timelineData.days.length}>
                  <div className="flex relative mx-2">
                    {timelineData.days.map((day, dayIndex) => (
                      <div key={dayIndex} className="flex-1 text-center relative">
                        <div className={`text-sm font-bold px-2 py-1 rounded shadow-sm ${
                          isToday(day) 
                            ? 'text-blue-600 bg-blue-50 border-2 border-blue-300' 
                            : 'text-gray-800 bg-white border border-gray-400'
                        }`}>
                          {isToday(day) ? (
                            <span>Heute</span>
                          ) : (
                            <span>{day.getDate()}</span>
                          )}
                        </div>
                        {/* Vertikale Linie rechts (außer beim letzten Tag) */}
                        {dayIndex < timelineData.days.length - 1 && (
                          <div className="absolute top-0 right-0 w-px h-full bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </th>
              </tr>
              
              {/* Wochentag-Zeile */}
              <tr>
                <th className="px-4 py-2"></th>
                <th className="px-0 py-2" colSpan={timelineData.days.length}>
                  <div className="flex relative mx-2">
                    {timelineData.days.map((day, dayIndex) => (
                      <div key={dayIndex} className="flex-1 text-center relative">
                        <div className={`text-sm font-bold px-2 py-1 rounded ${
                          isToday(day) 
                            ? 'text-blue-600 bg-blue-50 border border-blue-300' 
                            : day.getDay() === 0 || day.getDay() === 6
                            ? 'text-red-600 bg-red-50 border border-red-300'
                            : 'text-gray-700 bg-gray-50 border border-gray-300'
                        }`}>
                          {day.toLocaleDateString('de-DE', { weekday: 'short' })}
                        </div>
                        {/* Vertikale Linie rechts (außer beim letzten Tag) */}
                        {dayIndex < timelineData.days.length - 1 && (
                          <div className="absolute top-0 right-0 w-px h-full bg-gray-300"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </th>
              </tr>
            </thead>

            {/* Wohnungen mit Status */}
            <tbody className="divide-y divide-gray-200">
              {allApartments.map((apartment) => (
                <tr key={apartment.id} className="hover:bg-gray-50 h-16">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {apartment.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {apartment.address}
                        </div>
                        <div className="text-xs text-gray-400">
                          {apartment.beds} Bett{apartment.beds > 1 ? 'en' : ''} • €{apartment.price}/Tag
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Timeline-Balken für alle Tage */}
                  <td className="px-0 py-4 border-l border-gray-200" colSpan={timelineData.days.length}>
                    <div className="relative h-8 mx-2">
                      {/* Hintergrund-Grid */}
                      <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                        {timelineData.days.map((day, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`flex-1 relative ${
                              isToday(day) ? 'bg-blue-50' : 'bg-gray-50'
                            }`}
                          >
                            {/* Vertikale Linie rechts (außer beim letzten Tag) */}
                            {dayIndex < timelineData.days.length - 1 && (
                              <div className="absolute top-0 right-0 w-px h-full bg-gray-300 z-10"></div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Status-Balken */}
                      <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                        {timelineData.days.map((day, dayIndex) => {
                          const status = getApartmentStatus(apartment, day);
                          const isLastDay = dayIndex === timelineData.days.length - 1;
                          const nextDay = dayIndex < timelineData.days.length - 1 ? timelineData.days[dayIndex + 1] : null;
                          const nextStatus = nextDay ? getApartmentStatus(apartment, nextDay) : null;
                          const isFirstDay = dayIndex === 0;
                          
                          return (
                            <div
                              key={dayIndex}
                              className={`flex-1 relative ${
                                isLastDay ? '' : 'border-r border-gray-200'
                              }`}
                            >
                              {/* Status-Balken */}
                              <div
                                className={`h-full ${getStatusColor(status)} ${
                                  status === 'free' ? 'opacity-20' : 'opacity-90'
                                } transition-all duration-300 hover:opacity-100 cursor-pointer group relative`}
                                onMouseEnter={(e) => {
                                  const booking = getBookingForDate(apartment, day);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredTooltip({
                                    apartment,
                                    day,
                                    booking,
                                    status,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top - 10
                                  });
                                }}
                                onMouseLeave={() => setHoveredTooltip(null)}
                              >
                                {/* Balken-Effekte */}
                                <div className={`absolute inset-0 ${
                                  status === 'free' ? 'bg-gradient-to-r from-transparent to-transparent' :
                                  status === 'occupied' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                                  'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                } opacity-50`} />
                                
                                {/* Status-Text für belegte Tage */}
                                {status !== 'free' && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-30 px-1 rounded">
                                      {getStatusText(status).charAt(0)}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Hover-Effekt */}
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
                              </div>
                              
                              {/* Verbindungslinie zwischen gleichen Status */}
                              {!isLastDay && status === nextStatus && status !== 'free' && (
                                <div className={`absolute top-1/2 -right-px w-px h-6 ${getStatusColor(status)} transform -translate-y-1/2 opacity-60`} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Buchungsbalken mit Drag & Resize */}
                      <div className="absolute inset-0">
                        {bookings
                          .filter(b => b.apartmentId === apartment.id)
                          .map(booking => {
                            const bookingStart = new Date(booking.startDate);
                            const bookingEnd = new Date(booking.endDate);
                            const viewStart = new Date(timelineData.startDate);
                            const viewEnd = new Date(timelineData.endDate);

                            // Schneide auf sichtbaren Bereich zu
                            const clippedStart = bookingStart > viewStart ? bookingStart : viewStart;
                            const clippedEnd = bookingEnd < viewEnd ? bookingEnd : viewEnd;
                            if (clippedEnd < viewStart || clippedStart > viewEnd) return null;

                            const totalDays = getTotalDaysInView();
                            const leftDays = diffInDays(viewStart, clippedStart);
                            const spanDays = diffInDays(clippedStart, clippedEnd) + 1;

                            let styleLeft = (leftDays / totalDays) * 100;
                            let styleWidth = (spanDays / totalDays) * 100;

                            // Live-Vorschau während Drag
                            if (dragState && dragState.bookingId === booking.id && scrollContainerRef.current) {
                              const calc = calculateNewDatesFromDrag(
                                booking.apartmentId,
                                booking,
                                scrollContainerRef.current,
                                dragState.currentClientX ?? dragState.startClientX,
                                dragState.type,
                                { originalStart: dragState.originalStart, originalEnd: dragState.originalEnd }
                              );
                              if (calc) {
                                const previewStart = clampDateToRange(calc.newStart, viewStart, viewEnd);
                                const previewEnd = clampDateToRange(calc.newEnd, viewStart, viewEnd);
                                const pLeftDays = diffInDays(viewStart, previewStart);
                                const pSpanDays = Math.max(1, diffInDays(previewStart, previewEnd) + 1);
                                styleLeft = (pLeftDays / totalDays) * 100;
                                styleWidth = (pSpanDays / totalDays) * 100;
                              }
                            }

                            return (
                              <div
                                key={booking.id}
                                className="absolute top-0 h-8"
                                style={{ left: `${styleLeft}%`, width: `${styleWidth}%` }}
                              >
                                <div
                                  className="h-full bg-rose-500/40 hover:bg-rose-600/50 text-white text-xs font-semibold rounded flex items-center justify-between shadow cursor-pointer group"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredTooltip({
                                      apartment,
                                      day: new Date(booking.startDate), // Verwende Startdatum der Buchung
                                      booking,
                                      status: 'occupied',
                                      x: rect.left + rect.width / 2,
                                      y: rect.top - 10
                                    });
                                  }}
                                  onMouseLeave={() => setHoveredTooltip(null)}
                                >
                                  {/* Resize Handle links */}
                                  <div
                                    className="w-2 h-full cursor-col-resize bg-rose-700/40 hover:bg-rose-800/50"
                                    onPointerDown={(e) => {
                                      e.stopPropagation();
                                      e.currentTarget.setPointerCapture(e.pointerId);
                                      setDragState({
                                        type: 'resize-start',
                                        bookingId: booking.id,
                                        originalStart: booking.startDate,
                                        originalEnd: booking.endDate,
                                        startClientX: e.clientX,
                                        currentClientX: e.clientX,
                                        lastEdgeSwitchAt: 0
                                      });
                                    }}
                                    onMouseEnter={(e) => e.stopPropagation()}
                                    onMouseLeave={(e) => e.stopPropagation()}
                                  />

                                  {/* Drag Handle (nur hier startet Verschieben) */}
                                  <div
                                    className="w-3 h-full cursor-grab bg-rose-700/30 hover:bg-rose-800/40"
                                    onPointerDown={(e) => {
                                      e.stopPropagation();
                                      e.currentTarget.setPointerCapture(e.pointerId);
                                      setDragState({
                                        type: 'move',
                                        bookingId: booking.id,
                                        originalStart: booking.startDate,
                                        originalEnd: booking.endDate,
                                        startClientX: e.clientX,
                                        currentClientX: e.clientX,
                                        lastEdgeSwitchAt: 0
                                      });
                                    }}
                                    onMouseEnter={(e) => e.stopPropagation()}
                                    onMouseLeave={(e) => e.stopPropagation()}
                                  />

                                  <div 
                                    className="px-2 truncate cursor-pointer hover:bg-white/10 rounded"
                                    onClick={() => handleBookingClick(booking)}
                                  >
                                    {booking.title || booking.guestName || 'Buchung'}
                                  </div>

                                  {/* Resize Handle rechts */}
                                  <div
                                    className="w-2 h-full cursor-col-resize bg-rose-700/40 hover:bg-rose-800/50"
                                    onPointerDown={(e) => {
                                      e.stopPropagation();
                                      e.currentTarget.setPointerCapture(e.pointerId);
                                      setDragState({
                                        type: 'resize-end',
                                        bookingId: booking.id,
                                        originalStart: booking.startDate,
                                        originalEnd: booking.endDate,
                                        startClientX: e.clientX,
                                        currentClientX: e.clientX,
                                        lastEdgeSwitchAt: 0
                                      });
                                    }}
                                    onMouseEnter={(e) => e.stopPropagation()}
                                    onMouseLeave={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legende */}
      <CalendarLegend />

      {/* Schönes Tooltip */}
      {hoveredTooltip && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
          style={{
            left: `${hoveredTooltip.x}px`,
            top: `${hoveredTooltip.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {/* Tooltip-Pfeil */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
          
          {/* Tooltip-Inhalt */}
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 text-sm">
                {hoveredTooltip.apartment.name}
              </h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                hoveredTooltip.status === 'free' ? 'bg-green-100 text-green-800' :
                hoveredTooltip.status === 'occupied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {getStatusText(hoveredTooltip.status)}
              </div>
            </div>
            
            {/* Datum */}
            <div className="text-sm text-gray-600">
              {hoveredTooltip.booking ? (
                <div>
                  <div className="font-medium">
                    {new Date(hoveredTooltip.booking.startDate).toLocaleDateString('de-DE', { 
                      weekday: 'long', 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    bis {new Date(hoveredTooltip.booking.endDate).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              ) : (
                hoveredTooltip.day.toLocaleDateString('de-DE', { 
                  weekday: 'long', 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })
              )}
            </div>
            
            {/* Buchungsdetails */}
            {hoveredTooltip.booking ? (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {hoveredTooltip.booking.guestName}
                  </div>
                  {hoveredTooltip.booking.company && (
                    <div className="text-xs text-gray-600">
                      {hoveredTooltip.booking.company}
                    </div>
                  )}
                  {hoveredTooltip.booking.guestEmail && (
                    <div className="text-xs text-gray-500">{hoveredTooltip.booking.guestEmail}</div>
                  )}
                  {hoveredTooltip.booking.guestPhone && (
                    <div className="text-xs text-gray-500">{hoveredTooltip.booking.guestPhone}</div>
                  )}
                </div>
                
                {hoveredTooltip.booking.pricePerNight > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preis:</span>
                    <span className="font-medium text-gray-900">
                      €{hoveredTooltip.booking.pricePerNight}/Nacht
                    </span>
                  </div>
                )}
                
                {hoveredTooltip.booking.notes && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Notizen:</strong> {hoveredTooltip.booking.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                Keine Buchung vorhanden
              </div>
            )}
          </div>
        </div>
      )}

      {/* ApartmentDetail Modal */}
      {selectedApartment && (
        <ApartmentDetailResponsive
          apartment={selectedApartment}
          isOpen={isApartmentDetailOpen}
          onClose={handleApartmentDetailClose}
          onEdit={handleEditApartment}
          onUpdateApartment={handleUpdateApartment}
          bookings={bookings.filter(booking => booking.apartmentId === selectedApartment.id)}
          onAddBooking={handleAddBooking}
          onUpdateBooking={handleUpdateBooking}
          onDeleteBooking={handleDeleteBooking}
        />
      )}
    </div>
  );
};

export default TimelineCalendar;