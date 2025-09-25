import { Bed, MapPin, Euro, Calendar, Wifi, Car, Home, TreePine, Trees, WashingMachine, Clock, Star, Eye, Edit, Trash2 } from 'lucide-react';
import Badge from '../UI/Badge';
import { STATUS_COLORS } from '../../utils/constants';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';

// Icon-Mapping für Amenities
const getAmenityIcon = (amenity) => {
  const iconMap = {
    'WiFi': Wifi,
    'Parkplatz': Car,
    'Balkon': Home,
    'Terrasse': TreePine,
    'Garten': Trees,
    'Waschmaschine': WashingMachine
  };
  return iconMap[amenity] || Home;
};

// Erweiterte Apartment-Karten-Komponente mit mehr Features
const ApartmentCardEnhanced = ({ apartment, onClick, onEdit, onDelete, showActions = true }) => {
  const { getApartmentCurrentStatus } = useApartments();
  
  // Verwende aktuellen Status basierend auf Buchungen
  const currentStatus = getApartmentCurrentStatus(apartment);
  const statusConfig = STATUS_COLORS[currentStatus] || STATUS_COLORS.frei;
  
  // Berechne Tage seit letzter Reinigung
  const getDaysSinceCleaning = () => {
    const lastCleaned = new Date(apartment.lastCleaned);
    const today = new Date();
    const diffTime = Math.abs(today - lastCleaned);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceCleaning = getDaysSinceCleaning();

  // Berechne Reinigungsstatus
  const getCleaningStatus = () => {
    if (daysSinceCleaning <= 3) return { status: 'fresh', color: 'text-green-600', label: 'Frisch gereinigt' };
    if (daysSinceCleaning <= 7) return { status: 'good', color: 'text-blue-600', label: 'Gut' };
    if (daysSinceCleaning <= 14) return { status: 'warning', color: 'text-yellow-600', label: 'Reinigung bald fällig' };
    return { status: 'urgent', color: 'text-red-600', label: 'Reinigung dringend' };
  };

  const cleaningStatus = getCleaningStatus();

  const handleCardClick = (e) => {
    // Verhindere Klick auf Aktionen
    if (e.target.closest('.action-button')) return;
    onClick(apartment);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit && onEdit(apartment);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete && onDelete(apartment.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 group relative`}
    >
      {/* Aktionen-Overlay */}
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="action-button p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="Bearbeiten"
            >
              <Edit className="h-3 w-3 text-blue-600" />
            </button>
            <button
              onClick={handleDelete}
              className="action-button p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="Löschen"
            >
              <Trash2 className="h-3 w-3 text-red-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(apartment);
              }}
              className="action-button p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              title="Details anzeigen"
            >
              <Eye className="h-3 w-3 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Header mit Name und Status */}
      <div className="flex items-start justify-between mb-3 pr-16">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {apartment.name}
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{apartment.address}</span>
          </div>
        </div>
        <Badge status={currentStatus} showIcon={true} />
      </div>

      {/* Beschreibung */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {apartment.description}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Betten */}
        <div className="flex items-center text-gray-600">
          <Bed className="h-4 w-4 mr-2" />
          <span className="text-sm">{apartment.beds} Bett{apartment.beds > 1 ? 'en' : ''}</span>
        </div>

        {/* Preis */}
        <div className="flex items-center text-gray-600">
          <Euro className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{apartment.price}/Tag</span>
        </div>
      </div>

      {/* Amenities mit Icons */}
      {apartment.amenities && apartment.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {apartment.amenities.slice(0, 4).map((amenity, index) => {
            const IconComponent = getAmenityIcon(amenity);
            return (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                title={amenity}
              >
                <IconComponent className="h-3 w-3 mr-1" />
                {amenity}
              </span>
            );
          })}
          {apartment.amenities.length > 4 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              +{apartment.amenities.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Status-spezifische Informationen */}
      {currentStatus === 'wartung' && (
        <div className="flex items-center text-yellow-700 text-xs mb-2">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Wartung heute</span>
        </div>
      )}

      {/* Reinigungsstatus */}
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center ${cleaningStatus.color}`}>
          <Clock className="h-3 w-3 mr-1" />
          <span>{cleaningStatus.label}</span>
        </div>
        <div className="text-gray-500">
          {daysSinceCleaning} Tag{daysSinceCleaning !== 1 ? 'e' : ''}
        </div>
      </div>

      {/* Fortschrittsbalken für Reinigung */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              cleaningStatus.status === 'fresh' ? 'bg-green-500' :
              cleaningStatus.status === 'good' ? 'bg-blue-500' :
              cleaningStatus.status === 'warning' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(100, Math.max(0, 100 - (daysSinceCleaning * 5)))}%` 
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Klicken für Details
          </div>
          <div className="text-xs text-gray-400">
            ID: {apartment.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCardEnhanced;