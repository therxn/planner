// Legende für den Timeline-Kalender - Modernisiert
const CalendarLegend = () => {
  return (
    <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-6">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-600 rounded-lg mr-3">
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Legende</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-lg mr-3 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Frei verfügbar</span>
        </div>
        <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Belegt</span>
        </div>
        <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg mr-3 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">In Wartung</span>
        </div>
        <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="w-6 h-6 bg-blue-600 border-2 border-blue-700 rounded-lg mr-3 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Heute markiert</span>
        </div>
        <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div className="w-6 h-6 bg-blue-100 border border-blue-200 rounded-lg mr-3 shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Wochenende</span>
        </div>
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="text-blue-600 mr-2">💡</div>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-1">Tipp:</p>
            <p className="text-xs text-blue-700">
              Fahre mit der Maus über die Balken für Details. Kontinuierliche Belegungen werden durch Verbindungslinien dargestellt. 
              <span className="font-medium">Buchungen können per Drag & Drop verschoben und in der Größe angepasst werden.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;