import { useState, useRef, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

// Einfaches Overlay-Tooltip für Löschbestätigung direkt in der Karte
const DeleteTooltip = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  message = "Wirklich löschen?"
}) => {
  const tooltipRef = useRef(null);

  // Außerhalb klicken schließt das Tooltip
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={tooltipRef}
      className="absolute inset-0 bg-transparent flex items-center justify-center z-50 rounded-lg"
    >
      {/* Tooltip-Box */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-w-sm mx-4">
        {/* Warnung-Icon und Text */}
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-gray-700">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Löschen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook für einfache Verwendung
export const useDeleteTooltip = () => {
  const [tooltip, setTooltip] = useState({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const showTooltip = (message, onConfirm) => {
    setTooltip({
      isOpen: true,
      message,
      onConfirm
    });
  };

  const hideTooltip = () => {
    setTooltip({
      isOpen: false,
      message: '',
      onConfirm: null
    });
  };

  const TooltipComponent = () => (
    <DeleteTooltip
      isOpen={tooltip.isOpen}
      onClose={hideTooltip}
      onConfirm={tooltip.onConfirm}
      message={tooltip.message}
    />
  );

  return {
    showTooltip,
    hideTooltip,
    TooltipComponent,
    isOpen: tooltip.isOpen
  };
};

export default DeleteTooltip;