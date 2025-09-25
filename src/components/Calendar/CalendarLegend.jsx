// Legende für den Timeline-Kalender
const CalendarLegend = () => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Legende</h3>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center">
          <div className="w-8 h-4 bg-green-500 rounded mr-2 opacity-20"></div>
          <span className="text-sm text-gray-600">Frei verfügbar</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-4 bg-red-500 rounded mr-2 opacity-90"></div>
          <span className="text-sm text-gray-600">Belegt</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-4 bg-yellow-500 rounded mr-2 opacity-90"></div>
          <span className="text-sm text-gray-600">In Wartung</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-4 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Heute markiert</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Wochenende</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        💡 <strong>Tipp:</strong> Fahre mit der Maus über die Balken für Details. Kontinuierliche Belegungen werden durch Verbindungslinien dargestellt.
      </div>
    </div>
  );
};

export default CalendarLegend;