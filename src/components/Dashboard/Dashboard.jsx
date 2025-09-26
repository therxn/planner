import { useState } from 'react';
import { Home, Plus, RotateCcw } from 'lucide-react';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';
import { DEFAULT_GRID_CLASS, DEFAULT_VALUES } from '../../utils/constants';
import ApartmentCard from './ApartmentCard';
import ApartmentCardCompact from './ApartmentCardCompact';
import ApartmentCardEnhanced from './ApartmentCardEnhanced';
import ApartmentDetailResponsive from './ApartmentDetailResponsive';
import ApartmentForm from './ApartmentForm';
import SearchFilter from './SearchFilter';
import ViewModeToggle from './ViewModeToggle';

// Haupt-Dashboard-Komponente
const Dashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState(null);
  
  
  const {
    apartments,
    stats,
    loading,
    error,
    searchTerm,
    statusFilter,
    bedsFilter,
    availabilityFilter,
    selectedApartment,
    setSearchTerm,
    setStatusFilter,
    setBedsFilter,
    setAvailabilityFilter,
    resetFilters,
    openApartmentDetails,
    closeApartmentDetails,
    addApartment,
    updateApartment,
    removeApartment,
    addBooking,
    updateBooking,
    removeBooking,
    getBookingsForApartment,
    refreshData,
    refreshBookingsForApartment
  } = useApartments();

  // Formular-Handler
  const handleAddApartment = () => {
    setEditingApartment(null);
    setIsFormOpen(true);
  };

  const handleEditApartment = (apartment) => {
    setEditingApartment(apartment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingApartment) {
        await updateApartment(editingApartment.id, formData);
      } else {
        await addApartment(formData);
      }
      handleFormClose();
    } catch (error) {
      console.error('Fehler beim Speichern der Wohnung:', error);
      // Hier könntest du eine Toast-Nachricht oder ähnliches anzeigen
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingApartment(null);
  };

  // Inline-Updates aus Detail-Ansicht (z. B. letzte Reinigung)
  const handleUpdateApartmentInline = async (id, updates) => {
    try {
      const updated = await updateApartment(id, updates);
      // Ausgewählte Wohnung mit aktualisierten Daten ersetzen
      if (updated) {
        // Hook-State aktualisieren: offene Details auf den aktualisierten Datensatz setzen
        openApartmentDetails(updated);
      }
      return updated;
    } catch (e) {
      console.error('Inline-Update fehlgeschlagen:', e);
      throw e;
    }
  };


  // Render-Funktion für verschiedene Ansichtsmodi
  const renderApartmentCard = (apartment) => {
    const commonProps = {
      apartment,
      onClick: async () => {
        // Nur Buchungen für diese Wohnung aktualisieren und dann öffnen
        try { await refreshBookingsForApartment(apartment.id); } catch (e) { console.error(e); }
        openApartmentDetails(apartment);
      },
      onEdit: () => handleEditApartment(apartment),
      onDelete: () => removeApartment(apartment.id, true)
    };

    switch (viewMode) {
      case 'compact':
        return <ApartmentCardCompact key={apartment.id} {...commonProps} />;
      case 'enhanced':
        return <ApartmentCardEnhanced key={apartment.id} {...commonProps} />;
      default:
        return <ApartmentCard key={apartment.id} {...commonProps} />;
    }
  };

  // Grid-Klassen basierend auf Ansichtsmodus
  const getGridClasses = () => {
    switch (viewMode) {
      case 'compact':
        return 'space-y-4';
      case 'enhanced':
        return `grid gap-8 ${DEFAULT_GRID_CLASS.replace('grid-cols-1', 'grid-cols-1').replace('md:grid-cols-2', 'md:grid-cols-2').replace('lg:grid-cols-3', 'lg:grid-cols-2').replace('xl:grid-cols-4', 'xl:grid-cols-3')}`;
      default:
        return DEFAULT_GRID_CLASS;
    }
  };

  // Fehler-Anzeige
  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Fehler beim Laden der Daten</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={refreshData}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading-Anzeige
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 p-3 rounded-lg">
                  <div className="h-6 bg-gray-200 rounded w-8 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header mit Statistiken - Modernisiert */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wohnungsübersicht</h1>
              <p className="text-gray-600 mt-1">Verwalten Sie Ihre Monteurwohnungen</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddApartment}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Wohnung hinzufügen</span>
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Filter zurücksetzen</span>
            </button>
          </div>
        </div>

        {/* Statistiken-Karten - Modernisiert */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Gesamt</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">{stats.frei}</div>
            <div className="text-sm text-gray-600 font-medium">Frei</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.belegt}</div>
            <div className="text-sm text-gray-600 font-medium">Belegt</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-amber-600">{stats.wartung}</div>
            <div className="text-sm text-gray-600 font-medium">Wartung</div>
          </div>
        </div>
      </div>

      {/* Such- und Filterbereich */}
      <SearchFilter
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        bedsFilter={bedsFilter}
        availabilityFilter={availabilityFilter}
        onSearchChange={setSearchTerm}
        onStatusChange={setStatusFilter}
        onBedsChange={setBedsFilter}
        onAvailabilityChange={setAvailabilityFilter}
      />

      {/* Wohnungs-Grid - Modernisiert */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Home className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Wohnungen ({apartments.length})
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 font-medium bg-white rounded-lg px-3 py-1 shadow-sm border border-gray-200">
                Belegungsgrad: {stats.belegungsgrad}%
              </div>
              <ViewModeToggle 
                currentMode={viewMode} 
                onModeChange={setViewMode} 
              />
            </div>
          </div>
        </div>
        <div className="p-6">

          {apartments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">🏠</div>
              <p className="text-gray-600">{DEFAULT_VALUES.NO_RESULTS_MESSAGE}</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Alle Filter zurücksetzen
              </button>
            </div>
          ) : (
            <div className={getGridClasses()}>
              {apartments.map(renderApartmentCard)}
            </div>
          )}
        </div>
      </div>

      {/* Apartment Detail Modal/Drawer */}
      <ApartmentDetailResponsive
        apartment={selectedApartment}
        isOpen={!!selectedApartment}
        onClose={closeApartmentDetails}
        onEdit={handleEditApartment}
        onUpdateApartment={handleUpdateApartmentInline}
        bookings={selectedApartment ? getBookingsForApartment(selectedApartment.id) : []}
        onAddBooking={addBooking}
        onUpdateBooking={updateBooking}
        onDeleteBooking={async (bookingId) => {
          await removeBooking(bookingId, true);
          // Nur Buchungen der geöffneten Wohnung aktualisieren
          if (selectedApartment) {
            try { await refreshBookingsForApartment(selectedApartment.id); } catch (e) { console.error(e); }
          }
        }}
      />

      {/* Apartment Form Modal */}
      <ApartmentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        apartment={editingApartment}
        title={editingApartment ? "Wohnung bearbeiten" : "Wohnung hinzufügen"}
      />
    </div>
  );
};

export default Dashboard;