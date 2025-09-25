import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Bed, 
  Euro, 
  Calendar, 
  Wifi, 
  Car, 
  Home, 
  TreePine, 
  Trees, 
  WashingMachine,
  FileText,
  Settings,
  Star,
  ChevronDown,
  ChevronRight,
  Save
} from 'lucide-react';

// Formular-Komponente für Hinzufügen/Bearbeiten von Wohnungen
const ApartmentForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  apartment = null, 
  title = "Wohnung hinzufügen" 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'frei',
    beds: 1,
    description: '',
    price: '',
    amenities: '',
    lastCleaned: '',
    nextCleaning: '',
    occupiedUntil: '',
    notizen: ''
  });

  const [errors, setErrors] = useState({});
  const [isGrunddatenExpanded, setIsGrunddatenExpanded] = useState(true);

  // Formular mit Daten füllen wenn bearbeitet wird
  useEffect(() => {
    if (apartment) {
      setFormData({
        name: apartment.name || '',
        address: apartment.address || '',
        status: apartment.status || 'frei',
        beds: apartment.beds || 1,
        description: apartment.description || '',
        price: apartment.price || '',
        amenities: apartment.amenities ? apartment.amenities.join(', ') : '',
        lastCleaned: apartment.lastCleaned || '',
        nextCleaning: apartment.nextCleaning || '',
        occupiedUntil: apartment.occupiedUntil || '',
        notizen: apartment.notizen || ''
      });
    } else {
      // Reset für neue Wohnung
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setFormData({
        name: '',
        address: '',
        status: 'frei',
        beds: 1,
        description: '',
        price: '',
        amenities: '',
        lastCleaned: today,
        nextCleaning: nextMonth,
        occupiedUntil: '',
        notizen: ''
      });
    }
    setErrors({});
  }, [apartment, isOpen]);

  // Validierung
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adresse ist erforderlich';
    }

    if (!formData.beds || formData.beds < 1) {
      newErrors.beds = 'Mindestens 1 Bett erforderlich';
    }

    if (!formData.status) {
      newErrors.status = 'Status ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Formular-Handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Fehler für dieses Feld entfernen
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      status: 'frei',
      beds: 1,
      description: '',
      price: '',
      amenities: '',
      lastCleaned: '',
      nextCleaning: '',
      availableFrom: '',
      occupiedUntil: '',
      notizen: ''
    });
    setErrors({});
    onClose();
  };

  // ESC-Taste Handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Speichern"
            >
              <Save className="h-5 w-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Grunddaten */}
          <div className="bg-gray-50 rounded-lg p-3">
            <button
              type="button"
              onClick={() => setIsGrunddatenExpanded(!isGrunddatenExpanded)}
              className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-100 rounded p-1 -m-1 transition-colors"
            >
              <h3 className="text-base font-semibold text-gray-900">Grunddaten</h3>
              {isGrunddatenExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
            {isGrunddatenExpanded && (
              <div className="space-y-3">
              {/* Name */}
              <div className="flex items-center">
                <Home className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Name</div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-400 bg-red-50' : ''
                    }`}
                    placeholder="Wohnungsname eingeben"
                  />
                  {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                </div>
              </div>

              {/* Adresse */}
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Adresse</div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.address ? 'border-red-400 bg-red-50' : ''
                    }`}
                    placeholder="Adresse eingeben"
                  />
                  {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                </div>
              </div>

              {/* Betten */}
              <div className="flex items-center">
                <Bed className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Betten</div>
                  <input
                    type="number"
                    name="beds"
                    min="1"
                    value={formData.beds}
                    onChange={handleInputChange}
                    className={`w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.beds ? 'border-red-400 bg-red-50' : ''
                    }`}
                    placeholder="Anzahl Betten"
                  />
                  {errors.beds && <div className="text-red-500 text-xs mt-1">{errors.beds}</div>}
                </div>
              </div>

              {/* Preis */}
              <div className="flex items-center">
                <Euro className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Preis pro Tag</div>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Preis eingeben"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Status</div>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full text-sm font-medium bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.status ? 'border-red-400 bg-red-50' : ''
                    }`}
                  >
                    <option value="frei">Frei</option>
                    <option value="belegt">Belegt</option>
                    <option value="wartung">Wartung</option>
                  </select>
                  {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                </div>
              </div>
              </div>
            )}
          </div>

          {/* Ausstattung */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Ausstattung</h3>
            <div className="space-y-1">
              <div className="flex items-center">
                <Settings className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex-1">
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="WiFi, Parkplatz, Balkon..."
                  />
                </div>
              </div>
            </div>
          </div>

          

          {/* Beschreibung */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-gray-700 text-sm">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="2"
                placeholder="Beschreibung der Wohnung..."
              />
            </p>
          </div>

          {/* Notizen */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Notizen</h3>
            <textarea
              name="notizen"
              value={formData.notizen}
              onChange={handleInputChange}
              className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows="2"
              placeholder="Interne Notizen..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Schließen
            </button>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApartmentForm;