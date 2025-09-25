/**
 * Generiert eine eindeutige ID mit Präfix
 * @param {string} prefix - Präfix für die ID (Standard: 'W')
 * @returns {string} Eindeutige ID im Format: prefix-timestamp
 */
export const generateId = (prefix = 'W') => {
  return `${prefix}-${Date.now()}`;
};

/**
 * Generiert eine Wohnungs-ID
 * @returns {string} Wohnungs-ID im Format: W-timestamp
 */
export const generateApartmentId = () => {
  return generateId('W');
};