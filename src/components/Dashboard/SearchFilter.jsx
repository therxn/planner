import { Search, Filter, X } from 'lucide-react';
import { filterOptions } from '../../data/mockData';
import { DEFAULT_VALUES } from '../../utils/constants';

// Such- und Filter-Komponente
const SearchFilter = ({
  searchTerm,
  statusFilter,
  bedsFilter,
  availabilityFilter,
  onSearchChange,
  onStatusChange,
  onBedsChange,
  onAvailabilityChange
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || bedsFilter !== 'all' || availabilityFilter !== 'all';

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">Suche & Filter</h3>
        </div>
        
        <div className="flex items-center gap-4 flex-1 max-w-4xl">
          {/* Suchfeld */}
          <div className="relative flex-1 min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={DEFAULT_VALUES.SEARCH_PLACEHOLDER}
              className="block w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Status-Filter */}
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {filterOptions.status.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Betten-Filter */}
          <div className="w-48">
            <select
              value={bedsFilter}
              onChange={(e) => onBedsChange(e.target.value)}
              className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {filterOptions.beds.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Verfügbarkeits-Filter */}
          <div className="w-48">
            <select
              value={availabilityFilter}
              onChange={(e) => onAvailabilityChange(e.target.value)}
              className="block w-full px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {filterOptions.availability.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2 whitespace-nowrap">
            <span className="text-xs text-gray-500">Filter aktiv</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>


      {/* Aktive Filter anzeigen */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Suche: "{searchTerm}"
                <button
                  onClick={() => onSearchChange('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Status: {filterOptions.status.find(s => s.value === statusFilter)?.label}
                <button
                  onClick={() => onStatusChange('all')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {bedsFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Betten: {filterOptions.beds.find(b => b.value === bedsFilter)?.label}
                <button
                  onClick={() => onBedsChange('all')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {availabilityFilter !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                Verfügbarkeit: {filterOptions.availability.find(a => a.value === availabilityFilter)?.label}
                <button
                  onClick={() => onAvailabilityChange('all')}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;