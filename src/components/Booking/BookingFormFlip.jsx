import { useState, useEffect, useCallback } from 'react';
import { Calendar, User, X, AlertTriangle, Euro } from 'lucide-react';
import { bookingUtils } from '../../data/bookingData';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';

// Kompaktes Buchungsformular für die Rückseite der Karte
const BookingFormFlip = ({ 
  apartment, 
  selectedDateRange,
  onSubmit, 
  onClose
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { bookings } = useApartments();

  // Formular zurücksetzen
  const resetForm = useCallback(() => {
    setFormData({
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
    setErrors({});
  }, [apartment?.price]);

  // Formular mit ausgewählten Daten füllen
  useEffect(() => {
    if (selectedDateRange) {
      setFormData(prev => ({
        ...prev,
        startDate: selectedDateRange.startDate.toISOString().split('T')[0],
        endDate: selectedDateRange.endDate.toISOString().split('T')[0]
      }));
    } else {
      // Wenn keine Datumsauswahl vorhanden ist, Formular zurücksetzen
      resetForm();
    }
  }, [selectedDateRange, resetForm]);

  // Prüfe auf Überschneidungen mit bestehenden Buchungen
  const checkForOverlaps = (startDate, endDate) => {
    const apartmentBookings = bookings.filter(booking => 
      booking.apartmentId === apartment.id
    );

    return apartmentBookings.some(booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      return (newStart <= bookingEnd && newEnd >= bookingStart);
    });
  };

  // Formular-Validierung
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Titel erforderlich';
    }

    if (!formData.guestName.trim()) {
      newErrors.guestName = 'Name erforderlich';
    }

    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = 'Telefon erforderlich';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Startdatum erforderlich';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Enddatum erforderlich';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        newErrors.endDate = 'Enddatum muss nach Startdatum liegen';
      }

      if (checkForOverlaps(formData.startDate, formData.endDate)) {
        newErrors.startDate = 'Zeitraum überschneidet sich';
        newErrors.endDate = 'Zeitraum überschneidet sich';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formular-Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        title: formData.title,
        company: formData.company,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        notes: formData.notes,
        pricePerNight: formData.pricePerNight,
        status: 'upcoming',
        apartmentId: apartment.id,
        totalPrice: bookingUtils.getBookingDuration({
          startDate: formData.startDate,
          endDate: formData.endDate
        }) * formData.pricePerNight,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };

      await onSubmit(bookingData);
      // Formular nach erfolgreichem Hinzufügen zurücksetzen
      resetForm();
    } catch (error) {
      console.error('Fehler beim Erstellen der Buchung:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eingabe-Handler
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-200">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-blue-600 mr-2" />
          <h2 className="text-sm font-bold text-gray-900">
            Schnellbuchung
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-100 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Wohnungsinfo */}
      <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
        <div className="text-sm font-medium text-gray-900">
          {apartment?.name}
        </div>
        <div className="text-xs text-gray-600">
          {formData.startDate && formData.endDate ? 
            `${formData.startDate} - ${formData.endDate}` : 
            `${apartment?.beds} Bett${apartment?.beds > 1 ? 'en' : ''} • €${apartment?.price}/Tag`
          }
        </div>
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-3">
        {/* Titel und Firma */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Titel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="z.B. Monteur Schmidt"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Firma
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="z.B. Bauunternehmen ABC"
            />
          </div>
        </div>

        {/* Startdatum und Enddatum */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Startdatum *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Enddatum *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Name und E-Mail */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.guestName}
              onChange={(e) => handleInputChange('guestName', e.target.value)}
              className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                errors.guestName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Max Mustermann"
            />
            {errors.guestName && (
              <p className="text-red-500 text-xs mt-1">{errors.guestName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => handleInputChange('guestEmail', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="max@beispiel.de"
            />
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            value={formData.guestPhone}
            onChange={(e) => handleInputChange('guestPhone', e.target.value)}
            className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.guestPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+49 123 456789"
          />
          {errors.guestPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.guestPhone}</p>
          )}
        </div>

        {/* Überschneidungswarnung */}
        {formData.startDate && formData.endDate && checkForOverlaps(formData.startDate, formData.endDate) && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <div className="flex items-center">
              <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
              <p className="text-xs text-red-600">
                Zeitraum überschneidet sich
              </p>
            </div>
          </div>
        )}

        {/* Gesamtpreis */}
        {formData.startDate && formData.endDate && (
          <div className="bg-gray-50 border border-gray-200 rounded p-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Gesamtpreis:</span>
              <span className="font-semibold text-gray-900">
                €{totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {bookingUtils.getBookingDuration({
                startDate: formData.startDate,
                endDate: formData.endDate
              })} Nächte × €{formData.pricePerNight}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded transition-colors"
          >
            {isSubmitting ? 'Wird gebucht...' : 'Buchen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingFormFlip;
