// ⚠️ WARNUNG: DIESE DATEI IST DEAKTIVIERT ⚠️
// Diese Mock-Buchungsdaten werden NICHT mehr verwendet!
// Das System verwendet jetzt ausschließlich die Supabase-Datenbank.
// 
// Falls du diese Datei wieder aktivieren möchtest, ändere den Import
// in den entsprechenden Komponenten von useSupabaseApartments zurück zu useApartments.

// Buchungsdaten für Monteurwohnungen (DEAKTIVIERT)
export const mockBookings = [
  {
    id: 'booking-1',
    apartmentId: 2, // Wohnung B
    title: 'Monteur Schmidt',
    company: 'Bauunternehmen ABC',
    startDate: '2024-01-15',
    endDate: '2024-01-24',
    status: 'active', // active, completed, cancelled
    guestName: 'Max Schmidt',
    guestEmail: 'max.schmidt@bau-abc.de',
    guestPhone: '+49 123 456789',
    notes: 'Langzeit-Monteur, benötigt Parkplatz',
    pricePerNight: 35,
    totalPrice: 350,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    id: 'booking-2',
    apartmentId: 5, // Wohnung E
    title: 'Monteur Müller',
    company: 'Elektro Müller GmbH',
    startDate: '2024-01-20',
    endDate: '2024-01-29',
    status: 'active',
    guestName: 'Peter Müller',
    guestEmail: 'p.mueller@elektro-mueller.de',
    guestPhone: '+49 987 654321',
    notes: 'Kurzzeit-Monteur, 1 Woche',
    pricePerNight: 40,
    totalPrice: 360,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18'
  },
  {
    id: 'booking-3',
    apartmentId: 1, // Wohnung A
    title: 'Monteur Weber',
    company: 'Sanitär Weber',
    startDate: '2024-01-25',
    endDate: '2024-01-30',
    status: 'upcoming',
    guestName: 'Thomas Weber',
    guestEmail: 't.weber@sanitaer-weber.de',
    guestPhone: '+49 555 123456',
    notes: 'Wartungsarbeiten, 5 Tage',
    pricePerNight: 45,
    totalPrice: 225,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  },
  {
    id: 'booking-4',
    apartmentId: 1, // Wohnung A - weitere Buchung
    title: 'Monteur Klein',
    company: 'Heizung Klein',
    startDate: '2024-02-05',
    endDate: '2024-02-12',
    status: 'upcoming',
    guestName: 'Michael Klein',
    guestEmail: 'm.klein@heizung-klein.de',
    guestPhone: '+49 777 987654',
    notes: 'Heizungsinstallation, 1 Woche',
    pricePerNight: 45,
    totalPrice: 315,
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22'
  },
  {
    id: 'booking-5',
    apartmentId: 3, // Wohnung C
    title: 'Wartung',
    company: 'Hausmeister Service',
    startDate: '2024-01-18',
    endDate: '2024-01-20',
    status: 'active',
    guestName: 'Hausmeister',
    guestEmail: 'hausmeister@service.de',
    guestPhone: '+49 111 222333',
    notes: 'Renovierungsarbeiten, Bad und Küche',
    pricePerNight: 0,
    totalPrice: 0,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
];

// Buchungsstatus-Konfiguration
export const bookingStatusConfig = {
  active: {
    label: "Aktiv",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    borderColor: "border-blue-200"
  },
  upcoming: {
    label: "Geplant",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200"
  },
  completed: {
    label: "Abgeschlossen",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    borderColor: "border-gray-200"
  },
  cancelled: {
    label: "Storniert",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200"
  }
};

// Hilfsfunktionen für Buchungen
export const bookingUtils = {
  // Prüft ob ein Datum in einer Buchung liegt
  isDateInBooking: (date, booking) => {
    const checkDate = new Date(date);
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    return checkDate >= startDate && checkDate <= endDate;
  },

  // Findet alle aktiven Buchungen für ein Datum
  getActiveBookingsForDate: (date, bookings) => {
    return bookings.filter(booking => 
      booking.status === 'active' && bookingUtils.isDateInBooking(date, booking)
    );
  },

  // Berechnet die Gesamtdauer einer Buchung
  getBookingDuration: (booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 für inklusive Enddatum
  },

  // Formatiert ein Datum für die Anzeige
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Generiert eine neue Buchungs-ID
  generateBookingId: () => {
    return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};