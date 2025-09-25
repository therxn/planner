import { supabaseHelpers } from '../lib/supabase.js'
import { mockApartments } from '../data/mockData.js'
import { mockBookings } from '../data/bookingData.js'

// Migration Script - einmalig ausführen um Mock-Daten zu Supabase zu übertragen
export const migrationUtils = {
  async migrateApartments() {
    console.log('Migriere Wohnungen zu Supabase...')
    
    try {
      const migratedApartments = []
      
      for (const apartment of mockApartments) {
        const supabaseApartment = {
          name: apartment.name,
          address: apartment.address,
          status: apartment.status,
          beds: apartment.beds,
          description: apartment.description,
          price: apartment.price,
          amenities: apartment.amenities,
          lastCleaned: apartment.lastCleaned,
          nextMaintenance: apartment.nextMaintenance,
          availableFrom: apartment.availableFrom,
          occupiedUntil: apartment.occupiedUntil
        }
        
        const created = await supabaseHelpers.createApartment(supabaseApartment)
        migratedApartments.push(created)
        console.log(`✓ Wohnung "${apartment.name}" migriert`)
      }
      
      console.log(`${migratedApartments.length} Wohnungen erfolgreich migriert`)
      return migratedApartments
    } catch (error) {
      console.error('Fehler bei der Wohnungs-Migration:', error)
      throw error
    }
  },

  async migrateBookings(apartmentMapping = {}) {
    console.log('Migriere Buchungen zu Supabase...')
    
    try {
      const migratedBookings = []
      
      for (const booking of mockBookings) {
        // Falls apartmentMapping leer ist, verwende die Original-IDs
        const apartmentId = apartmentMapping[booking.apartmentId] || booking.apartmentId
        
        const supabaseBooking = {
          id: booking.id,
          apartmentId: apartmentId,
          title: booking.title,
          company: booking.company,
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          guestPhone: booking.guestPhone,
          notes: booking.notes,
          pricePerNight: booking.pricePerNight,
          totalPrice: booking.totalPrice
        }
        
        const created = await supabaseHelpers.createBooking(supabaseBooking)
        migratedBookings.push(created)
        console.log(`✓ Buchung "${booking.title}" migriert`)
      }
      
      console.log(`${migratedBookings.length} Buchungen erfolgreich migriert`)
      return migratedBookings
    } catch (error) {
      console.error('Fehler bei der Buchungs-Migration:', error)
      throw error
    }
  },

  async runFullMigration() {
    console.log('Starte vollständige Migration...')
    
    try {
      // 1. Migriere Wohnungen
      const apartments = await this.migrateApartments()
      
      // 2. Erstelle Mapping zwischen alten und neuen IDs
      const apartmentMapping = {}
      mockApartments.forEach((mockApt, index) => {
        apartmentMapping[mockApt.id] = apartments[index].id
      })
      
      // 3. Migriere Buchungen mit neuen Apartment-IDs
      const bookings = await this.migrateBookings(apartmentMapping)
      
      console.log('✅ Migration erfolgreich abgeschlossen!')
      console.log(`- ${apartments.length} Wohnungen migriert`)
      console.log(`- ${bookings.length} Buchungen migriert`)
      
      return {
        apartments,
        bookings,
        apartmentMapping
      }
    } catch (error) {
      console.error('❌ Migration fehlgeschlagen:', error)
      throw error
    }
  },

  // Hilfsfunktion zum Testen der Verbindung
  async testConnection() {
    try {
      const apartments = await supabaseHelpers.getApartments()
      console.log('✅ Supabase Verbindung erfolgreich')
      console.log(`Gefundene Wohnungen in DB: ${apartments.length}`)
      return true
    } catch (error) {
      console.error('❌ Supabase Verbindung fehlgeschlagen:', error)
      return false
    }
  },

  // Entwickler-Hilfsfunktion zum Zurücksetzen der Datenbank
  async resetDatabase() {
    console.log('⚠️  Lösche alle Daten...')
    
    try {
      // Import supabase hier, um zirkuläre Abhängigkeiten zu vermeiden
      const { supabase } = await import('../lib/supabase.js')
      
      // Erst Buchungen löschen (wegen Foreign Key)
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .neq('id', '')
      
      if (bookingsError) throw bookingsError
      
      // Dann Wohnungen löschen
      const { error: apartmentsError } = await supabase
        .from('apartments')
        .delete()
        .neq('id', 0)
      
      if (apartmentsError) throw apartmentsError
      
      console.log('✅ Datenbank erfolgreich zurückgesetzt')
    } catch (error) {
      console.error('❌ Fehler beim Zurücksetzen:', error)
      throw error
    }
  }
}

// Exportiere für einfache Verwendung in der Browser-Konsole
if (typeof window !== 'undefined') {
  window.migrationUtils = migrationUtils
}
