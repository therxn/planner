import { Grid3X3, List, LayoutGrid } from 'lucide-react';

// Ansichtsmodus-Toggle-Komponente
const ViewModeToggle = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: 'grid', label: 'Grid', icon: Grid3X3 },
    { id: 'compact', label: 'Kompakt', icon: List },
    { id: 'enhanced', label: 'Erweitert', icon: LayoutGrid }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            title={mode.label}
          >
            <Icon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ViewModeToggle;