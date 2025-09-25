// Konstanten für das Monteurplanner-Dashboard

// Responsive Grid-Klassen
export const GRID_CLASSES = {
  mobile: 'grid-cols-1',
  tablet: 'md:grid-cols-2',
  desktop: 'lg:grid-cols-3',
  large: 'xl:grid-cols-4'
};

// Standard Grid-Klasse
export const DEFAULT_GRID_CLASS = `grid gap-8 ${GRID_CLASSES.mobile} ${GRID_CLASSES.tablet} ${GRID_CLASSES.desktop} ${GRID_CLASSES.large}`;

// Farben für verschiedene Status
export const STATUS_COLORS = {
  frei: {
    primary: 'green',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800'
  },
  belegt: {
    primary: 'red',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800'
  },
  wartung: {
    primary: 'yellow',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800'
  }
};

// Icon-Mapping für verschiedene Features
export const FEATURE_ICONS = {
  WiFi: 'wifi',
  Parkplatz: 'car',
  Balkon: 'home',
  Terrasse: 'tree-pine',
  Garten: 'trees',
  Waschmaschine: 'washing-machine'
};

// Standard-Werte
export const DEFAULT_VALUES = {
  SEARCH_PLACEHOLDER: 'Nach Name oder Adresse suchen...',
  NO_RESULTS_MESSAGE: 'Keine Wohnungen gefunden, die den Suchkriterien entsprechen.',
  LOADING_MESSAGE: 'Lade Wohnungen...'
};

// Breakpoints für responsive Design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};