// Legende für den Belegungskalender
const CalendarLegend = ({ size = 'small' }) => {
  if (size === 'small') {
    return (
      <div className="flex justify-center space-x-2 text-xs">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-200 border border-green-300 rounded mr-1"></div>
          <span>Frei</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-200 border border-red-300 rounded mr-1"></div>
          <span>Belegt</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-200 border border-yellow-300 rounded mr-1"></div>
          <span>Wartung</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center space-x-4 text-sm">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-green-200 border border-green-300 rounded mr-2"></div>
        <span>Frei</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-red-200 border border-red-300 rounded mr-2"></div>
        <span>Belegt</span>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded mr-2"></div>
        <span>Wartung</span>
      </div>
    </div>
  );
};

export default CalendarLegend;