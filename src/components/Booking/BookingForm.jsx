import { useState, useEffect } from 'react';
import { Calendar, User, Building, Phone, Mail, Euro, FileText, X, AlertTriangle, Bed } from 'lucide-react';
import { bookingUtils } from '../../data/bookingData';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';

// Buchungsformular für neue Termine
const BookingForm = ({ 
  apartment, 
  isOpen, 
  onClose, 
  onSubmit, 
  editingBooking = null,
  preSelectedDates = null,
  embedded = false // eingebetteter Modus für Flip-Rückseite
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
    pricePerNight: apartment?.price || 0
  });

  const [errors, setErrors] = useState({});
  const { bookings } = useApartments();

  // Formular zurücksetzen oder mit Bearbeitungsdaten füllen
  useEffect(() => {
    if (editingBooking) {
      setFormData({
        title: editingBooking.title || '',
        company: editingBooking.company || '',
        startDate: editingBooking.startDate || '',
        endDate: editingBooking.endDate || '',
        guestName: editingBooking.guestName || '',
        guestEmail: editingBooking.guestEmail || '',
        guestPhone: editingBooking.guestPhone || '',
        notes: editingBooking.notes || '',
        pricePerNight: editingBooking.pricePerNight || apartment?.price || 0
      });
    } else {
      setFormData({
        title: '',
        company: '',
        startDate: preSelectedDates?.startDate || '',
        endDate: preSelectedDates?.endDate || '',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        notes: '',
        pricePerNight: apartment?.price || 0
      });
    }
    setErrors({});
  }, [apartment, editingBooking, preSelectedDates, isOpen]);

  // Prüfe auf Überschneidungen mit bestehenden Buchungen
  const checkForOverlaps = (startDate, endDate, excludeBookingId = null) => {
    if (!apartment?.id) return false;
    
    const apartmentBookings = bookings.filter(booking => 
      booking.apartmentId === apartment.id && 
      booking.id !== excludeBookingId
    );

    return apartmentBookings.some(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      // Prüfe auf Überschneidung
      return (newStart <= bookingEnd && newEnd >= bookingStart);
    });
  };

  // Formular-Validierung
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Startdatum ist erforderlich';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Enddatum ist erforderlich';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        newErrors.endDate = 'Enddatum muss nach dem Startdatum liegen';
      }

      // Prüfe auf Überschneidungen
      if (checkForOverlaps(formData.startDate, formData.endDate, editingBooking?.id)) {
        newErrors.startDate = 'Zeitraum überschneidet sich mit bestehender Buchung';
        newErrors.endDate = 'Zeitraum überschneidet sich mit bestehender Buchung';
      }
    }

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Gastname ist erforderlich';
    }

    if (formData.guestEmail && !/\S+@\S+\.\S+/.test(formData.guestEmail)) {
      newErrors.guestEmail = 'Ungültige E-Mail-Adresse';
    }

    if (formData.pricePerNight < 0) {
      newErrors.pricePerNight = 'Preis darf nicht negativ sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formular-Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const bookingData = {
      ...formData,
      apartmentId: apartment.id,
      status: getBookingStatus(),
      totalPrice: bookingUtils.getBookingDuration({
        startDate: formData.startDate,
        endDate: formData.endDate
      }) * formData.pricePerNight,
      createdAt: editingBooking ? editingBooking.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSubmit(bookingData);
    onClose();
  };

  // Eingabe-Handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Fehler für dieses Feld entfernen
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Berechne Gesamtpreis
  const totalPrice = formData.startDate && formData.endDate 
    ? bookingUtils.getBookingDuration({
        startDate: formData.startDate,
        endDate: formData.endDate
      }) * formData.pricePerNight
    : 0;

  // Status automatisch basierend auf Datum berechnen
  const getBookingStatus = () => {
    if (!formData.startDate || !formData.endDate) return 'upcoming';
    
    const today = new Date().toISOString().split('T')[0];
    const startDate = formData.startDate;
    const endDate = formData.endDate;
    
    if (startDate > today) return 'upcoming';
    if (startDate <= today && endDate >= today) return 'active';
    return 'completed';
  };

  // Prüfe ob es sich um eine vergangene Buchung handelt
  const isPastBooking = () => {
    if (!formData.startDate || !formData.endDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return formData.endDate < today;
  };

  if (!isOpen || !apartment) return null;

  return (
    <div className={`${embedded ? 'w-full' : 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4'}`}>
      <div className={`${embedded ? 'w-full border border-gray-200 rounded-lg bg-gray-50' : 'max-w-md w-full border border-gray-100 rounded-md shadow-sm bg-white'}`}>
        {/* Header */}
        <div className={`${embedded ? 'flex items-center justify-between p-2' : 'flex items-center justify-between p-3 border-b border-gray-100'}`}>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
            <h2 className={`${embedded ? 'text-sm' : 'text-base'} font-semibold text-gray-900`}>
              {editingBooking ? 'Buchung bearbeiten' : 'Neue Buchung'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Wohnungsinfo entfernt auf Wunsch */}

        {/* Formular */}
        <form onSubmit={handleSubmit} className={`${embedded ? 'p-2' : 'p-3'} grid grid-cols-2 gap-2 text-xs`}>
          {/* Titel und Firma */}
          <div className={`${embedded ? 'col-span-1' : 'col-span-1'}`}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="z.B. Monteur Schmidt"
              />
              {errors.title && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

          <div className={`${embedded ? 'col-span-1' : 'col-span-1'}`}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Firma
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="z.B. Bauunternehmen ABC"
              />
            </div>
          
          {/* Datum */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Startdatum *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Enddatum *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Überschneidungswarnung */}
          {formData.startDate && formData.endDate && checkForOverlaps(formData.startDate, formData.endDate, editingBooking?.id) && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-xs text-red-600">
                  Zeitraum überschneidet sich mit bestehender Buchung
                </p>
              </div>
            </div>
          )}

          {/* Warnung für vergangene Buchungen */}
          {isPastBooking() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <p className="text-xs text-yellow-800">
                  <strong>Rückwirkende Buchung:</strong> Diese Buchung liegt in der Vergangenheit. 
                  Sie wird als "Abgeschlossen" markiert.
                </p>
              </div>
            </div>
          )}

          {/* Gastdaten */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.guestName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Max Mustermann"
              />
              {errors.guestName && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.guestName}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                E-Mail
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.guestEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="max@beispiel.de"
              />
              {errors.guestEmail && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.guestEmail}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+49 123 456789"
              />
            </div>
          </div>

          {/* Preis */}
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Preis/Nacht (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerNight}
                onChange={(e) => handleInputChange('pricePerNight', parseFloat(e.target.value) || 0)}
              className={`w-full px-2 py-1.5 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.pricePerNight ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.pricePerNight && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.pricePerNight}
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Gesamtpreis
              </label>
              <div className="flex items-center px-2 py-1.5 bg-gray-50 border border-gray-300 rounded">
                <Euro className="h-3 w-3 text-gray-500 mr-1" />
                <span className="font-semibold text-gray-900 text-sm">
                  €{totalPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-500 ml-1">
                  ({formData.startDate && formData.endDate ? 
                    bookingUtils.getBookingDuration({
                      startDate: formData.startDate,
                      endDate: formData.endDate
                    }) : 0} Nächte)
                </span>
              </div>
            </div>
          </div>

          {/* Notizen */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Besondere Anforderungen, Wünsche, etc."
            />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end space-x-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            >
              {editingBooking ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;