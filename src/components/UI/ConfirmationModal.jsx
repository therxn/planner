import { X, AlertTriangle, Trash2 } from 'lucide-react';

// Bestätigungs-Modal für Löschvorgänge
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Bestätigung erforderlich", 
  message = "Sind Sie sicher?",
  confirmText = "Löschen",
  cancelText = "Abbrechen",
  type = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash2,
          iconColor: 'text-red-500',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          accentColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          accentColor: 'text-yellow-600'
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-blue-500',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          accentColor: 'text-blue-600'
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <IconComponent className={`h-5 w-5 ${styles.iconColor} mr-2`} />
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3`}>
              <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${styles.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
