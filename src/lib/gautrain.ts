/**
 * Mapping of South African universities to their nearest Gautrain stations
 * Used to display Gautrain accessibility information on accommodations
 */

export const UNIVERSITY_GAUTRAIN_MAPPING: Record<string, string> = {
  // Gauteng Universities
  "University of Pretoria": "Hatfield/Pretoria Station",
  "UP": "Hatfield/Pretoria Station",
  "Pretoria University": "Hatfield/Pretoria Station",
  
  "University of South Africa": "UNISA Station",
  "UNISA": "UNISA Station",
  
  "Wits University": "Parktown/Braamfontein Station",
  "University of the Witwatersrand": "Parktown/Braamfontein Station",
  "WITS": "Parktown/Braamfontein Station",
  
  "Tshwane University of Technology": "Soshanguve Station",
  "TUT": "Soshanguve Station",
  
  "Vaal University of Technology": "Rosetenville Station",
  "VUT": "Rosetenville Station",
  
  // Western Cape Universities
  "University of Cape Town": "Not on Gautrain (CT-based)",
  "UCT": "Not on Gautrain (CT-based)",
  
  "Stellenbosch University": "Not on Gautrain (CT-based)",
  "SU": "Not on Gautrain (CT-based)",
  
  "Cape Peninsula University of Technology": "Not on Gautrain (CT-based)",
  "CPUT": "Not on Gautrain (CT-based)",
  
  // KZN Universities
  "University of KwaZulu-Natal": "Not on Gautrain (KZN-based)",
  "UKZN": "Not on Gautrain (KZN-based)",
  
  "Durban University of Technology": "Not on Gautrain (KZN-based)",
  "DUT": "Not on Gautrain (KZN-based)",
  
  // Other provinces
  "University of the Free State": "Not on Gautrain (FS-based)",
  "Rhodes University": "Not on Gautrain (EC-based)",
  "Nelson Mandela University": "Not on Gautrain (EC-based)",
  "University of Johannesburg": "Parktown Station",
  "UJ": "Parktown Station",
  "North-West University": "Not on Gautrain (NW-based)",
};

/**
 * Get the nearest Gautrain station for a given university
 * @param universityName - Name of the university
 * @returns The nearest Gautrain station name, or null if not found or not on Gautrain line
 */
export const getGautrainStation = (universityName: string): string | null => {
  if (!universityName) return null;

  // Normalize the input
  const normalized = universityName.trim();

  // Try exact match first
  if (UNIVERSITY_GAUTRAIN_MAPPING[normalized]) {
    return UNIVERSITY_GAUTRAIN_MAPPING[normalized];
  }

  // Try case-insensitive match
  const lowerCased = normalized.toLowerCase();
  for (const [key, station] of Object.entries(UNIVERSITY_GAUTRAIN_MAPPING)) {
    if (key.toLowerCase() === lowerCased) {
      return station;
    }
  }

  // Try partial match
  for (const [key, station] of Object.entries(UNIVERSITY_GAUTRAIN_MAPPING)) {
    if (key.toLowerCase().includes(lowerCased) || lowerCased.includes(key.toLowerCase())) {
      return station;
    }
  }

  return null;
};

/**
 * Check if a university is on the Gautrain line
 * @param universityName - Name of the university
 * @returns True if the university has Gautrain access
 */
export const isGautrainAccessible = (universityName: string): boolean => {
  const station = getGautrainStation(universityName);
  if (!station) return false;
  return !station.includes("Not on Gautrain");
};

// ============================================
// MyCiTi (Cape Town) Train Station Mapping
// ============================================

export const UNIVERSITY_MYCITI_MAPPING: Record<string, string> = {
  // Cape Town Universities
  "University of Cape Town": "Waterfront Station",
  "UCT": "Waterfront Station",

  "Stellenbosch University": "Civic Centre Station",
  "SU": "Civic Centre Station",

  "Cape Peninsula University of Technology": "Civic Centre Station",
  "CPUT": "Civic Centre Station",

  // Other Western Cape Universities
  "University of the Western Cape": "Civic Centre Station",
  "UWC": "Civic Centre Station",
};

/**
 * Get the nearest MyCiTi station for a given university (Cape Town)
 * @param universityName - Name of the university
 * @returns The nearest MyCiTi station name, or null if not found or not in Cape Town
 */
export const getMycitiStation = (universityName: string): string | null => {
  if (!universityName) return null;

  // Normalize the input
  const normalized = universityName.trim();

  // Try exact match first
  if (UNIVERSITY_MYCITI_MAPPING[normalized]) {
    return UNIVERSITY_MYCITI_MAPPING[normalized];
  }

  // Try case-insensitive match
  const lowerCased = normalized.toLowerCase();
  for (const [key, station] of Object.entries(UNIVERSITY_MYCITI_MAPPING)) {
    if (key.toLowerCase() === lowerCased) {
      return station;
    }
  }

  // Try partial match
  for (const [key, station] of Object.entries(UNIVERSITY_MYCITI_MAPPING)) {
    if (key.toLowerCase().includes(lowerCased) || lowerCased.includes(key.toLowerCase())) {
      return station;
    }
  }

  return null;
};

/**
 * Check if a university is on the MyCiTi line (Cape Town)
 * @param universityName - Name of the university
 * @returns True if the university has MyCiTi access
 */
export const isMycitiAccessible = (universityName: string): boolean => {
  const station = getMycitiStation(universityName);
  return !!station;
};
