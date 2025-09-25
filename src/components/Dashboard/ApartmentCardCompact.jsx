import { Bed, MapPin, Euro, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import Badge from '../UI/Badge';
import { STATUS_COLORS } from '../../utils/constants';
import { useSupabaseApartments as useApartments } from '../../hooks/useSupabaseApartments';

// Kompakte Apartment-Karten-Komponente für Listenansicht
const ApartmentCardCompact = ({ apartment, onClick, onEdit, onDelete }) => {
  const { getApartmentCurrentStatus } = useApartments();
  
  // Verwende aktuellen Status basierend auf Buchungen
  const currentStatus = getApartmentCurrentStatus(apartment);
  const statusConfig = STATUS_COLORS[currentStatus] || STATUS_COLORS.frei;

  // Handler für Action-Buttons
  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit && onEdit(apartment);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete && onDelete(apartment.id);
  };

  return (
    <div
      onClick={onClick}
      className={`${statusConfig.bg} ${statusConfig.border} border rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 relative group`}
    >
      {/* Action Buttons - erscheinen beim Hover */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
        <button
          onClick={handleEditClick}
          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title="Bearbeiten"
        >
          <Edit className="h-3 w-3 text-blue-600" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-1 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title="Löschen"
        >
          <Trash2 className="h-3 w-3 text-red-600" />
        </button>
      </div>
      <div className="flex items-center justify-between pr-16">
        {/* Linke Seite - Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {apartment.name}
              </h3>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{apartment.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Seite - Details */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Betten */}
          <div className="flex items-center text-gray-600 text-sm">
            <Bed className="h-4 w-4 mr-1" />
            <span>{apartment.beds}</span>
          </div>

          {/* Preis */}
          <div className="flex items-center text-gray-600 text-sm">
            <Euro className="h-4 w-4 mr-1" />
            <span className="font-medium">{apartment.price}</span>
          </div>

          {/* Status Badge */}
          <Badge status={currentStatus} />

          {/* Wartung Indicator */}
          {currentStatus === 'wartung' && (
            <div className="flex items-center text-yellow-600">
              <Calendar className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApartmentCardCompact;