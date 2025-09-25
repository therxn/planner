import { useMemo } from 'react';
import { Building, Users, Calendar, Clock } from 'lucide-react';

// Statistiken für den Kalender
const CalendarStats = ({ apartments, selectedDate }) => {
  const stats = useMemo(() => {
    const total = apartments.length;
    const frei = apartments.filter(a => a.status === 'frei').length;
    const belegt = apartments.filter(a => a.status === 'belegt').length;
    const wartung = apartments.filter(a => a.status === 'wartung').length;
    const belegungsgrad = total > 0 ? Math.round((belegt / total) * 100) : 0;

    // Berechne durchschnittliche Belegungsdauer
    const avgOccupancy = apartments
      .filter(a => a.occupiedUntil)
      .reduce((acc, a) => {
        const start = new Date(a.availableFrom);
        const end = new Date(a.occupiedUntil);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return acc + days;
      }, 0);

    const avgDays = apartments.filter(a => a.occupiedUntil).length > 0 
      ? Math.round(avgOccupancy / apartments.filter(a => a.occupiedUntil).length)
      : 0;

    return {
      total,
      frei,
      belegt,
      wartung,
      belegungsgrad,
      avgDays
    };
  }, [apartments]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Building className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">Gesamt</span>
        </div>
        <div className="text-2xl font-bold text-blue-600 mt-1">
          {stats.total}
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-green-800">Frei</span>
        </div>
        <div className="text-2xl font-bold text-green-600 mt-1">
          {stats.frei}
        </div>
        <div className="text-xs text-green-600 mt-1">
          {stats.total > 0 ? Math.round((stats.frei / stats.total) * 100) : 0}% verfügbar
        </div>
      </div>

      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-red-800">Belegt</span>
        </div>
        <div className="text-2xl font-bold text-red-600 mt-1">
          {stats.belegt}
        </div>
        <div className="text-xs text-red-600 mt-1">
          Belegungsgrad: {stats.belegungsgrad}%
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-yellow-800">Wartung</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600 mt-1">
          {stats.wartung}
        </div>
        <div className="text-xs text-yellow-600 mt-1">
          Ø {stats.avgDays} Tage Belegung
        </div>
      </div>
    </div>
  );
};

export default CalendarStats;