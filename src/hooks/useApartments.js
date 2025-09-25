// ⚠️ WARNUNG: DIESER HOOK IST DEAKTIVIERT ⚠️
// Dieser Hook verwendet Mock-Daten und wird NICHT mehr verwendet!
// Das System verwendet jetzt ausschließlich useSupabaseApartments mit der Supabase-Datenbank.
// 
// Falls du diesen Hook wieder aktivieren möchtest, ändere den Import
// in den entsprechenden Komponenten von useSupabaseApartments zurück zu useApartments.

import { useState, useMemo, useEffect } from 'react';
import { mockApartments } from '../data/mockData';
import { mockBookings, bookingUtils } from '../data/bookingData';
import { generateApartmentId } from '../utils/id';

// localStorage Keys
const APARTMENTS_STORAGE_KEY = 'apartments.v1';
const BOOKINGS_STORAGE_KEY = 'bookings.v1';

// Hilfsfunktionen zum Laden aus localStorage
const loadApartmentsFromStorage = () => {
  try {
    const stored = localStorage.getItem(APARTMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockApartments;
  } catch (error) {
    console.error('Fehler beim Laden der Apartments aus localStorage:', error);
    return mockApartments;
  }
};

const loadBookingsFromStorage = () => {
  try {
    const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockBookings;
  } catch (error) {
    console.error('Fehler beim Laden der Buchungen aus localStorage:', error);
    return mockBookings;
  }
};

// Hilfsfunktionen zum Speichern in localStorage
const saveApartmentsToStorage = (apartments) => {
  try {
    localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(apartments));
  } catch (error) {
    console.error('Fehler beim Speichern der Apartments in localStorage:', error);
  }
};

const saveBookingsToStorage = (bookings) => {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Fehler beim Speichern der Buchungen in localStorage:', error);
  }
};

// Custom Hook für Apartment-Management
export const useApartments = () => {
  const [apartments, setApartments] = useState(() => loadApartmentsFromStorage());
  const [bookings, setBookings] = useState(() => loadBookingsFromStorage());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bedsFilter, setBedsFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedApartment, setSelectedApartment] = useState(null);

  // localStorage synchronisieren bei Änderungen
  useEffect(() => {
    saveApartmentsToStorage(apartments);
  }, [apartments]);

  useEffect(() => {
    saveBookingsToStorage(bookings);
  }, [bookings]);

  // CRUD-Operationen
  const addApartment = (apartmentData) => {
    const newApartment = {
      id: generateApartmentId(),
      name: apartmentData.name,
      address: apartmentData.address,
      status: apartmentData.status,
      beds: Number(apartmentData.beds),
      description: apartmentData.description || '',
      price: apartmentData.price ? Number(apartmentData.price) : null,
      amenities: apartmentData.amenities ? 
        apartmentData.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
      lastCleaned: apartmentData.lastCleaned || new Date().toISOString().split('T')[0],
      nextMaintenance: apartmentData.nextMaintenance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availableFrom: apartmentData.availableFrom || new Date().toISOString().split('T')[0],
      occupiedUntil: apartmentData.occupiedUntil || null,
      notizen: apartmentData.notizen || ''
    };

    setApartments(prev => [...prev, newApartment]);
    return newApartment;
  };

  const updateApartment = (id, updates) => {
    setApartments(prev => prev.map(apartment => 
      apartment.id === id 
        ? { 
            ...apartment, 
            ...updates,
            beds: updates.beds ? Number(updates.beds) : apartment.beds,
            price: updates.price ? Number(updates.price) : apartment.price,
            amenities: updates.amenities ? 
              updates.amenities.split(',').map(s => s.trim()).filter(Boolean) : 
              apartment.amenities
          }
        : apartment
    ));
  };

  const removeApartment = (id) => {
    if (window.confirm('Wohnung wirklich löschen?')) {
      setApartments(prev => prev.filter(apartment => apartment.id !== id));
      // Auch alle Buchungen für diese Wohnung löschen
      setBookings(prev => prev.filter(booking => booking.apartmentId !== id));
    }
  };

  // Buchungs-CRUD-Operationen
  const addBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: bookingUtils.generateBookingId(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const updateBooking = (id, updates) => {
    setBookings(prev => prev.map(booking => 
      booking.id === id 
        ? { 
            ...booking, 
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : booking
    ));
  };

  const removeBooking = (id) => {
    if (window.confirm('Buchung wirklich löschen?')) {
      setBookings(prev => prev.filter(booking => booking.id !== id));
    }
  };

  // Buchungen für eine Wohnung abrufen
  const getBookingsForApartment = (apartmentId) => {
    return bookings.filter(booking => booking.apartmentId === apartmentId);
  };

  // Aktive Buchungen für ein Datum abrufen
  const getActiveBookingsForDate = (date) => {
    return bookingUtils.getActiveBookingsForDate(date, bookings);
  };

  // Aktuellen Status einer Wohnung basierend auf Buchungen berechnen
  const getApartmentCurrentStatus = (apartment) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Prüfe alle Buchungen für diese Wohnung heute
    const todayBookings = bookings.filter(booking => 
      booking.apartmentId === apartment.id &&
      today >= booking.startDate && 
      today <= booking.endDate
    );
    
    if (todayBookings.length > 0) {
      // Prüfe ob es eine Wartungsbuchung ist
      const maintenanceBooking = todayBookings.find(booking => 
        booking.title.toLowerCase().includes('wartung') || 
        booking.company.toLowerCase().includes('wartung') ||
        booking.company.toLowerCase().includes('hausmeister')
      );
      
      if (maintenanceBooking) {
        return 'wartung';
      }
      
      return 'belegt';
    }
    
    // Keine Buchung heute = frei
    return 'frei';
  };

  // Hilfsfunktion für Verfügbarkeits-Filter
  const isAvailableInTimeframe = (apartment, timeframe) => {
    if (timeframe === 'all') return true;
    
    const today = new Date();
    const availableFrom = new Date(apartment.availableFrom);
    
    switch (timeframe) {
      case 'now':
        return apartment.status === 'frei' && availableFrom <= today;
      case 'today':
        return availableFrom <= today;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return availableFrom <= tomorrow;
      case 'this_week':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return availableFrom <= endOfWeek;
      case 'next_week':
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);
        const nextWeekEnd = new Date(today);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
        return availableFrom >= nextWeekStart && availableFrom <= nextWeekEnd;
      default:
        return true;
    }
  };

  // Gefilterte Apartments basierend auf Suchbegriff und Filtern
  const filteredApartments = useMemo(() => {
    return apartments.filter(apartment => {
      // Suchbegriff-Filter (Name oder Adresse)
      const matchesSearch = searchTerm === '' || 
        apartment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apartment.address.toLowerCase().includes(searchTerm.toLowerCase());

      // Status-Filter
      const matchesStatus = statusFilter === 'all' || apartment.status === statusFilter;

      // Betten-Filter
      const matchesBeds = bedsFilter === 'all' || apartment.beds.toString() === bedsFilter;

      // Verfügbarkeits-Filter
      const matchesAvailability = isAvailableInTimeframe(apartment, availabilityFilter);

      return matchesSearch && matchesStatus && matchesBeds && matchesAvailability;
    });
  }, [apartments, searchTerm, statusFilter, bedsFilter, availabilityFilter]);

  // Statistiken berechnen
  const stats = useMemo(() => {
    const total = apartments.length;
    const frei = apartments.filter(a => a.status === 'frei').length;
    const belegt = apartments.filter(a => a.status === 'belegt').length;
    const wartung = apartments.filter(a => a.status === 'wartung').length;
    const belegungsgrad = total > 0 ? Math.round((belegt / total) * 100) : 0;

    return {
      total,
      frei,
      belegt,
      wartung,
      belegungsgrad
    };
  }, [apartments]);

  // Filter zurücksetzen
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBedsFilter('all');
    setAvailabilityFilter('all');
  };

  // Apartment-Details öffnen
  const openApartmentDetails = (apartment) => {
    setSelectedApartment(apartment);
  };

  // Apartment-Details schließen
  const closeApartmentDetails = () => {
    setSelectedApartment(null);
  };

  return {
    // Daten
    apartments: filteredApartments,
    allApartments: apartments,
    bookings,
    selectedApartment,
    stats,
    
    // Filter
    searchTerm,
    statusFilter,
    bedsFilter,
    availabilityFilter,
    
    // Aktionen
    setSearchTerm,
    setStatusFilter,
    setBedsFilter,
    setAvailabilityFilter,
    resetFilters,
    openApartmentDetails,
    closeApartmentDetails,
    
    // Apartment CRUD-Operationen
    addApartment,
    updateApartment,
    removeApartment,
    
    // Buchungs-CRUD-Operationen
    addBooking,
    updateBooking,
    removeBooking,
    getBookingsForApartment,
    getActiveBookingsForDate,
    getApartmentCurrentStatus
  };
};