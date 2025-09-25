// ⚠️ WARNUNG: DIESE DATEI IST DEAKTIVIERT ⚠️
// Diese Mock-Daten werden NICHT mehr verwendet!
// Das System verwendet jetzt ausschließlich die Supabase-Datenbank.
// 
// Falls du diese Datei wieder aktivieren möchtest, ändere den Import
// in den entsprechenden Komponenten von useSupabaseApartments zurück zu useApartments.

// Mock-Daten für Monteurwohnungen (DEAKTIVIERT)
export const mockApartments = [
  {
    id: 1,
    name: "Wohnung A",
    address: "Musterstraße 1, 12345 Berlin",
    status: "frei", // frei, belegt, wartung
    beds: 2,
    description: "Moderne 2-Zimmer Wohnung mit Balkon",
    price: 45,
    amenities: ["WiFi", "Parkplatz", "Balkon"],
    lastCleaned: "2024-01-15",
    nextMaintenance: "2024-02-15",
    availableFrom: "2024-01-20", // Wann wird die Wohnung frei
    occupiedUntil: null // Bis wann ist sie belegt (null wenn frei)
  },
  {
    id: 2,
    name: "Wohnung B",
    address: "Hauptstraße 15, 12345 Berlin",
    status: "belegt",
    beds: 1,
    description: "Kompakte 1-Zimmer Wohnung",
    price: 35,
    amenities: ["WiFi", "Parkplatz"],
    lastCleaned: "2024-01-10",
    nextMaintenance: "2024-03-01",
    availableFrom: "2024-01-25", // Wird am 25.01. frei
    occupiedUntil: "2024-01-24" // Belegt bis 24.01.
  },
  {
    id: 3,
    name: "Wohnung C",
    address: "Nebenstraße 8, 12345 Berlin",
    status: "wartung",
    beds: 3,
    description: "Große 3-Zimmer Wohnung mit Terrasse",
    price: 65,
    amenities: ["WiFi", "Parkplatz", "Terrasse", "Waschmaschine"],
    lastCleaned: "2024-01-12",
    nextMaintenance: "2024-01-20",
    availableFrom: "2024-01-22", // Frei nach Wartung
    occupiedUntil: null
  },
  {
    id: 4,
    name: "Wohnung D",
    address: "Bahnhofstraße 22, 12345 Berlin",
    status: "frei",
    beds: 2,
    description: "Zentrale Lage, 2-Zimmer Wohnung",
    price: 50,
    amenities: ["WiFi", "Parkplatz", "Balkon"],
    lastCleaned: "2024-01-14",
    nextMaintenance: "2024-02-28",
    availableFrom: "2024-01-18", // Sofort verfügbar
    occupiedUntil: null
  },
  {
    id: 5,
    name: "Wohnung E",
    address: "Industriestraße 5, 12345 Berlin",
    status: "belegt",
    beds: 1,
    description: "Praktische 1-Zimmer Wohnung",
    price: 40,
    amenities: ["WiFi", "Parkplatz"],
    lastCleaned: "2024-01-08",
    nextMaintenance: "2024-02-10",
    availableFrom: "2024-01-30", // Frei ab 30.01.
    occupiedUntil: "2024-01-29"
  },
  {
    id: 6,
    name: "Wohnung F",
    address: "Gartenweg 12, 12345 Berlin",
    status: "frei",
    beds: 4,
    description: "Familienwohnung mit 4 Zimmern",
    price: 80,
    amenities: ["WiFi", "Parkplatz", "Garten", "Waschmaschine"],
    lastCleaned: "2024-01-16",
    nextMaintenance: "2024-03-15",
    availableFrom: "2024-01-19", // Frei ab 19.01.
    occupiedUntil: null
  }
];

// Status-Konfiguration für bessere Darstellung
export const statusConfig = {
  frei: {
    label: "Frei",
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    borderColor: "border-green-200"
  },
  belegt: {
    label: "Belegt",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
    borderColor: "border-red-200"
  },
  wartung: {
    label: "Wartung",
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-200"
  }
};

// Filter-Optionen
export const filterOptions = {
  status: [
    { value: "all", label: "Alle Status" },
    { value: "frei", label: "Frei" },
    { value: "belegt", label: "Belegt" },
    { value: "wartung", label: "Wartung" }
  ],
  beds: [
    { value: "all", label: "Alle Betten" },
    { value: "1", label: "1 Bett" },
    { value: "2", label: "2 Betten" },
    { value: "3", label: "3 Betten" },
    { value: "4", label: "4 Betten" }
  ],
  availability: [
    { value: "all", label: "Alle Verfügbarkeiten" },
    { value: "now", label: "Sofort verfügbar" },
    { value: "today", label: "Heute frei" },
    { value: "tomorrow", label: "Morgen frei" },
    { value: "this_week", label: "Diese Woche frei" },
    { value: "next_week", label: "Nächste Woche frei" }
  ]
};