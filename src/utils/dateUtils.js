// Hilfsfunktionen für Datumsverarbeitung

/**
 * Konvertiert ein Date-Objekt zu einem ISO-Datum-String (YYYY-MM-DD) ohne Zeitzone-Probleme
 * @param {Date} date - Das zu konvertierende Datum
 * @returns {string} - Datum im Format YYYY-MM-DD
 */
export const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Prüft ob ein Datum innerhalb eines Buchungszeitraums liegt
 * @param {Date|string} checkDate - Das zu prüfende Datum
 * @param {string} startDate - Startdatum der Buchung (YYYY-MM-DD)
 * @param {string} endDate - Enddatum der Buchung (YYYY-MM-DD)
 * @returns {boolean} - True wenn das Datum in der Buchung liegt
 */
export const isDateInBookingRange = (checkDate, startDate, endDate) => {
  const dateStr = typeof checkDate === 'string' ? checkDate : formatDateToISO(checkDate);
  return dateStr >= startDate && dateStr <= endDate;
};

/**
 * Konvertiert einen ISO-Datum-String zu einem Date-Objekt
 * @param {string} dateString - Datum im Format YYYY-MM-DD
 * @returns {Date} - Date-Objekt
 */
export const parseISODate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Berechnet die Anzahl der Tage zwischen zwei Daten
 * @param {Date|string} startDate - Startdatum
 * @param {Date|string} endDate - Enddatum
 * @returns {number} - Anzahl der Tage (inklusiv)
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISODate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISODate(endDate) : endDate;
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 für inklusive Enddatum
};
