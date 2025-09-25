import { useState, useMemo, useEffect, useCallback } from 'react';
import { supabaseHelpers } from '../lib/supabase.js';
import { bookingUtils } from '../data/bookingData.js';

// Custom Hook für Apartment-Management mit Supabase
export const useSupabaseApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter-States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bedsFilter, setBedsFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedApartment, setSelectedApartment] = useState(null);

  // Daten von Supabase laden
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [apartmentsData, bookingsData] = await Promise.all([
        supabaseHelpers.getApartments(),
        supabaseHelpers.getBookings()
      ]);
      
      // Datenformat anpassen für Frontend-Kompatibilität
      const formattedApartments = apartmentsData.map(apt => ({
        id: apt.id,
        name: apt.name,
        address: apt.address,
        status: apt.status,
        beds: apt.beds,
        description: apt.description,
        price: apt.price || 0, // Fallback für null-Werte
        amenities: apt.amenities || [],
        lastCleaned: apt.last_cleaned || new Date().toISOString().split('T')[0],
        nextCleaning: apt.next_cleaning || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        occupiedUntil: apt.occupied_until || null,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at
      }));

      const formattedBookings = bookingsData.map(booking => ({
        id: booking.id,
        apartmentId: booking.apartment_id,
        title: booking.title,
        company: booking.company,
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        guestPhone: booking.guest_phone,
        notes: booking.notes,
        pricePerNight: booking.price_per_night,
        totalPrice: booking.total_price,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
        apartments: booking.apartments // Joined data
      }));
      
      setApartments(formattedApartments);
      setBookings(formattedBookings);
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial laden
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apartment CRUD-Operationen
  const addApartment = async (apartmentData) => {
    try {
      setError(null);
      const newApartment = await supabaseHelpers.createApartment({
        name: apartmentData.name,
        address: apartmentData.address,
        status: apartmentData.status || 'frei',
        beds: Number(apartmentData.beds),
        description: apartmentData.description || '',
        price: apartmentData.price ? Number(apartmentData.price) : 0,
        amenities: apartmentData.amenities ? 
          apartmentData.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
        lastCleaned: apartmentData.lastCleaned && apartmentData.lastCleaned.trim() !== '' ? apartmentData.lastCleaned : new Date().toISOString().split('T')[0],
        nextCleaning: apartmentData.nextCleaning && apartmentData.nextCleaning.trim() !== '' ? apartmentData.nextCleaning : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        occupiedUntil: apartmentData.occupiedUntil && apartmentData.occupiedUntil.trim() !== '' ? apartmentData.occupiedUntil : null
      });
      
      // Lokalen State aktualisieren
      const formattedApartment = {
        id: newApartment.id,
        name: newApartment.name,
        address: newApartment.address,
        status: newApartment.status,
        beds: newApartment.beds,
        description: newApartment.description,
        price: newApartment.price,
        amenities: newApartment.amenities || [],
        lastCleaned: newApartment.last_cleaned || new Date().toISOString().split('T')[0],
        nextCleaning: newApartment.next_cleaning || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        occupiedUntil: newApartment.occupied_until || null,
        createdAt: newApartment.created_at,
        updatedAt: newApartment.updated_at
      };
      
      setApartments(prev => [...prev, formattedApartment]);
      return formattedApartment;
    } catch (err) {
      console.error('Fehler beim Erstellen der Wohnung:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateApartment = async (id, updates) => {
    try {
      setError(null);
      
      // Datenformat für Supabase anpassen
      const supabaseUpdates = {
        name: updates.name,
        address: updates.address,
        status: updates.status,
        beds: updates.beds ? Number(updates.beds) : undefined,
        description: updates.description,
        price: updates.price !== undefined ? Number(updates.price) || 0 : undefined,
        amenities: updates.amenities ? 
          (typeof updates.amenities === 'string' ? 
            updates.amenities.split(',').map(s => s.trim()).filter(Boolean) : 
            updates.amenities) : undefined,
        lastCleaned: updates.lastCleaned && updates.lastCleaned.trim() !== '' ? updates.lastCleaned : undefined,
        nextCleaning: updates.nextCleaning && updates.nextCleaning.trim() !== '' ? updates.nextCleaning : undefined,
        occupiedUntil: updates.occupiedUntil && updates.occupiedUntil.trim() !== '' ? updates.occupiedUntil : undefined
      };
      
      // Undefined Werte entfernen
      Object.keys(supabaseUpdates).forEach(key => {
        if (supabaseUpdates[key] === undefined) {
          delete supabaseUpdates[key];
        }
      });
      
      const updatedApartment = await supabaseHelpers.updateApartment(id, supabaseUpdates);
      
      // Lokalen State aktualisieren
      const formattedApartment = {
        id: updatedApartment.id,
        name: updatedApartment.name,
        address: updatedApartment.address,
        status: updatedApartment.status,
        beds: updatedApartment.beds,
        description: updatedApartment.description,
        price: updatedApartment.price || 0,
        amenities: updatedApartment.amenities || [],
        lastCleaned: updatedApartment.last_cleaned || new Date().toISOString().split('T')[0],
        nextCleaning: updatedApartment.next_cleaning || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        occupiedUntil: updatedApartment.occupied_until || null,
        createdAt: updatedApartment.created_at,
        updatedAt: updatedApartment.updated_at
      };
      
      setApartments(prev => prev.map(apartment => 
        apartment.id === id ? formattedApartment : apartment
      ));
      
      return formattedApartment;
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Wohnung:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeApartment = async (id, skipConfirmation = false) => {
    if (!skipConfirmation) {
      // Verwende externes Bestätigungsmodal statt window.confirm
      return { requiresConfirmation: true, apartmentId: id };
    }
    
    try {
      setError(null);
      await supabaseHelpers.deleteApartment(id);
      
      // Lokalen State aktualisieren
      setApartments(prev => prev.filter(apartment => apartment.id !== id));
      setBookings(prev => prev.filter(booking => booking.apartmentId !== id));
      return { success: true };
    } catch (err) {
      console.error('Fehler beim Löschen der Wohnung:', err);
      setError(err.message);
      throw err;
    }
  };

  // Buchungs-CRUD-Operationen
  const addBooking = async (bookingData) => {
    try {
      setError(null);
      const newBooking = await supabaseHelpers.createBooking({
        id: bookingUtils.generateBookingId(),
        apartmentId: bookingData.apartmentId,
        title: bookingData.title,
        company: bookingData.company,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        status: bookingData.status || 'upcoming',
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        notes: bookingData.notes,
        pricePerNight: Number(bookingData.pricePerNight),
        totalPrice: Number(bookingData.totalPrice)
      });
      
      // Lokalen State aktualisieren
      const formattedBooking = {
        id: newBooking.id,
        apartmentId: newBooking.apartment_id,
        title: newBooking.title,
        company: newBooking.company,
        startDate: newBooking.start_date,
        endDate: newBooking.end_date,
        status: newBooking.status,
        guestName: newBooking.guest_name,
        guestEmail: newBooking.guest_email,
        guestPhone: newBooking.guest_phone,
        notes: newBooking.notes,
        pricePerNight: newBooking.price_per_night,
        totalPrice: newBooking.total_price,
        createdAt: newBooking.created_at,
        updatedAt: newBooking.updated_at
      };
      
      setBookings(prev => [...prev, formattedBooking]);
      
      // Statistiken werden automatisch durch useMemo neu berechnet
      return formattedBooking;
    } catch (err) {
      console.error('Fehler beim Erstellen der Buchung:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateBooking = async (id, updates) => {
    try {
      setError(null);
      const updatedBooking = await supabaseHelpers.updateBooking(id, updates);
      
      // Lokalen State aktualisieren
      const formattedBooking = {
        id: updatedBooking.id,
        apartmentId: updatedBooking.apartment_id,
        title: updatedBooking.title,
        company: updatedBooking.company,
        startDate: updatedBooking.start_date,
        endDate: updatedBooking.end_date,
        status: updatedBooking.status,
        guestName: updatedBooking.guest_name,
        guestEmail: updatedBooking.guest_email,
        guestPhone: updatedBooking.guest_phone,
        notes: updatedBooking.notes,
        pricePerNight: updatedBooking.price_per_night,
        totalPrice: updatedBooking.total_price,
        createdAt: updatedBooking.created_at,
        updatedAt: updatedBooking.updated_at
      };
      
      setBookings(prev => prev.map(booking => 
        booking.id === id ? formattedBooking : booking
      ));
      
      // Statistiken werden automatisch durch useMemo neu berechnet
      return formattedBooking;
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Buchung:', err);
      setError(err.message);
      throw err;
    }
  };

  const removeBooking = async (id, skipConfirmation = false) => {
    if (!skipConfirmation) {
      // Verwende externes Bestätigungsmodal statt window.confirm
      return { requiresConfirmation: true, bookingId: id };
    }
    
    try {
      setError(null);
      await supabaseHelpers.deleteBooking(id);
      
      // Lokalen State aktualisieren
      setBookings(prev => prev.filter(booking => booking.id !== id));
      // Kein globales Reload hier – gezieltes Nachladen übernimmt der Aufrufer
      // Statistiken werden automatisch durch useMemo neu berechnet
      return { success: true };
    } catch (err) {
      console.error('Fehler beim Löschen der Buchung:', err);
      setError(err.message);
      throw err;
    }
  };

  // Hilfsfunktionen (gleich wie im ursprünglichen Hook)
  const getBookingsForApartment = (apartmentId) => {
    return bookings.filter(booking => booking.apartmentId === apartmentId);
  };

  const getActiveBookingsForDate = (date) => {
    return bookingUtils.getActiveBookingsForDate(date, bookings);
  };

  const getApartmentCurrentStatus = (apartment) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = bookings.filter(booking => 
      booking.apartmentId === apartment.id &&
      today >= booking.startDate && 
      today <= booking.endDate
    );
    
    if (todayBookings.length > 0) {
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
    
    return 'frei';
  };

  const isAvailableInTimeframe = (apartment, timeframe) => {
    if (timeframe === 'all') return true;
    
    // Verwende dynamische Status-Berechnung
    const currentStatus = getApartmentCurrentStatus(apartment);
    
    switch (timeframe) {
      case 'now':
        return currentStatus === 'frei';
      case 'today':
        return currentStatus === 'frei';
      case 'tomorrow':
        return currentStatus === 'frei';
      case 'this_week':
        return currentStatus === 'frei';
      case 'next_week':
        return currentStatus === 'frei';
      default:
        return true;
    }
  };

  // Gefilterte Apartments
  const filteredApartments = useMemo(() => {
    return apartments.filter(apartment => {
      const matchesSearch = searchTerm === '' || 
        apartment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apartment.address.toLowerCase().includes(searchTerm.toLowerCase());

      // Verwende dynamische Status-Berechnung für Filter
      const currentStatus = getApartmentCurrentStatus(apartment);
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
      const matchesBeds = bedsFilter === 'all' || apartment.beds.toString() === bedsFilter;
      const matchesAvailability = isAvailableInTimeframe(apartment, availabilityFilter);

      return matchesSearch && matchesStatus && matchesBeds && matchesAvailability;
    });
  }, [apartments, bookings, searchTerm, statusFilter, bedsFilter, availabilityFilter]);

  // Statistiken
  const stats = useMemo(() => {
    const total = apartments.length;
    
    // Verwende dynamische Status-Berechnung basierend auf aktuellen Buchungen
    const statusCounts = apartments.reduce((acc, apartment) => {
      const currentStatus = getApartmentCurrentStatus(apartment);
      acc[currentStatus] = (acc[currentStatus] || 0) + 1;
      return acc;
    }, {});
    
    const frei = statusCounts.frei || 0;
    const belegt = statusCounts.belegt || 0;
    const wartung = statusCounts.wartung || 0;
    const belegungsgrad = total > 0 ? Math.round((belegt / total) * 100) : 0;

    return {
      total,
      frei,
      belegt,
      wartung,
      belegungsgrad
    };
  }, [apartments, bookings]);

  // Filter zurücksetzen
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBedsFilter('all');
    setAvailabilityFilter('all');
  };

  // Apartment-Details öffnen/schließen
  const openApartmentDetails = (apartment) => {
    setSelectedApartment(apartment);
  };

  const closeApartmentDetails = () => {
    setSelectedApartment(null);
  };

  // Daten neu laden
  const refreshData = () => {
    // Gib das Promise zurück, damit aufrufende Stellen warten können
    return loadData();
  };

  // Nur Buchungen für eine spezifische Wohnung neu laden
  const refreshBookingsForApartment = async (apartmentId) => {
    try {
      setError(null);
      const data = await supabaseHelpers.getBookingsByApartment(apartmentId);
      const formatted = data.map(booking => ({
        id: booking.id,
        apartmentId: booking.apartment_id,
        title: booking.title,
        company: booking.company,
        startDate: booking.start_date,
        endDate: booking.end_date,
        status: booking.status,
        guestName: booking.guest_name,
        guestEmail: booking.guest_email,
        guestPhone: booking.guest_phone,
        notes: booking.notes,
        pricePerNight: booking.price_per_night,
        totalPrice: booking.total_price,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }));

      setBookings(prev => {
        const withoutThisApartment = prev.filter(b => b.apartmentId !== apartmentId);
        return [...withoutThisApartment, ...formatted];
      });

      return formatted;
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Buchungen für Wohnung:', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    // Daten
    apartments: filteredApartments,
    allApartments: apartments,
    bookings,
    selectedApartment,
    stats,
    loading,
    error,
    
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
    refreshData,
    refreshBookingsForApartment,
    
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
