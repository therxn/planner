import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL und Anon Key müssen in .env.local definiert werden')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hilfsfunktionen für Datenbank-Operationen
export const supabaseHelpers = {
  // Wohnungen
  async getApartments() {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
  },

  async getApartmentById(id) {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createApartment(apartment) {
    // Nur existierende Spalten einfügen
    const insertData = {
      name: apartment.name,
      address: apartment.address,
      status: apartment.status || 'frei',
      beds: apartment.beds,
      description: apartment.description,
      price: apartment.price,
      amenities: apartment.amenities || []
    };
    
    // Datum-Felder nur hinzufügen wenn sie existieren und nicht leer sind
    if (apartment.lastCleaned && apartment.lastCleaned.trim() !== '') {
      insertData.last_cleaned = apartment.lastCleaned;
    }
    if (apartment.nextCleaning && apartment.nextCleaning.trim() !== '') {
      insertData.next_cleaning = apartment.nextCleaning;
    }
    if (apartment.occupiedUntil && apartment.occupiedUntil.trim() !== '') {
      insertData.occupied_until = apartment.occupiedUntil;
    }
    
    const { data, error } = await supabase
      .from('apartments')
      .insert([insertData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateApartment(id, updates) {
    // Nur existierende Spalten aktualisieren
    const updateData = {};
    
    // Basis-Felder
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.beds !== undefined) updateData.beds = updates.beds;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.amenities !== undefined) updateData.amenities = updates.amenities;
    
    // Datum-Felder (nur wenn sie existieren und nicht leer sind)
    if (updates.lastCleaned !== undefined && updates.lastCleaned && updates.lastCleaned.trim() !== '') {
      updateData.last_cleaned = updates.lastCleaned;
    }
    if (updates.nextCleaning !== undefined && updates.nextCleaning && updates.nextCleaning.trim() !== '') {
      updateData.next_cleaning = updates.nextCleaning;
    }
    if (updates.occupiedUntil !== undefined && updates.occupiedUntil && updates.occupiedUntil.trim() !== '') {
      updateData.occupied_until = updates.occupiedUntil;
    }
    
    const { data, error } = await supabase
      .from('apartments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteApartment(id) {
    const { error } = await supabase
      .from('apartments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Buchungen
  async getBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        apartments (
          name,
          address
        )
      `)
      .order('start_date')
    
    if (error) throw error
    return data
  },

  async getBookingsByApartment(apartmentId) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('apartment_id', apartmentId)
      .order('start_date')
    
    if (error) throw error
    return data
  },

  async createBooking(booking) {
    const insertData = {
      id: booking.id,
      apartment_id: booking.apartmentId,
      title: booking.title,
      company: booking.company,
      status: booking.status || 'upcoming',
      guest_name: booking.guestName,
      guest_email: booking.guestEmail,
      guest_phone: booking.guestPhone,
      notes: booking.notes,
      price_per_night: booking.pricePerNight,
      total_price: booking.totalPrice
    };
    
    // Datum-Felder nur hinzufügen wenn sie nicht leer sind
    if (booking.startDate && booking.startDate.trim() !== '') {
      insertData.start_date = booking.startDate;
    }
    if (booking.endDate && booking.endDate.trim() !== '') {
      insertData.end_date = booking.endDate;
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([insertData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateBooking(id, updates) {
    const updateData = {
      apartment_id: updates.apartmentId,
      title: updates.title,
      company: updates.company,
      status: updates.status,
      guest_name: updates.guestName,
      guest_email: updates.guestEmail,
      guest_phone: updates.guestPhone,
      notes: updates.notes,
      price_per_night: updates.pricePerNight,
      total_price: updates.totalPrice
    };
    
    // Datum-Felder nur hinzufügen wenn sie nicht leer sind
    if (updates.startDate && updates.startDate.trim() !== '') {
      updateData.start_date = updates.startDate;
    }
    if (updates.endDate && updates.endDate.trim() !== '') {
      updateData.end_date = updates.endDate;
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteBooking(id) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Erweiterte Abfragen
  async getAvailableApartments(startDate, endDate) {
    const { data, error } = await supabase
      .from('apartments')
      .select(`
        *,
        bookings!inner (
          start_date,
          end_date,
          status
        )
      `)
      .not('bookings.status', 'eq', 'cancelled')
      .or(`bookings.end_date.lt.${startDate},bookings.start_date.gt.${endDate}`)
    
    if (error) throw error
    return data
  },

  async getBookingsInDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        apartments (
          name,
          address
        )
      `)
      .gte('end_date', startDate)
      .lte('start_date', endDate)
      .neq('status', 'cancelled')
      .order('start_date')
    
    if (error) throw error
    return data
  }
}
