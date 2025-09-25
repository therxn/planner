import { X } from 'lucide-react';

// Drawer-Komponente für mobile Geräte
const Drawer = ({ isOpen, onClose, title, children, position = "right" }) => {
  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
    top: 'top-0',
    bottom: 'bottom-0'
  };

  const slideClasses = {
    left: 'transform -translate-x-full',
    right: 'transform translate-x-full',
    top: 'transform -translate-y-full',
    bottom: 'transform translate-y-full'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed ${positionClasses[position]} h-full w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : slideClasses[position]
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="h-full overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;