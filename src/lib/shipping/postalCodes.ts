// Mexican postal codes are five digits and the first two identify the state. That is all the
// order flow needs to tell a buyer where their freight will be quoted to; the full official
// catalog is not shipped with the site because its terms forbid redistribution.
const STATE_RANGES: Array<[from: number, to: number, state: string]> = [
  [1, 16, 'Ciudad de México'],
  [20, 20, 'Aguascalientes'],
  [21, 22, 'Baja California'],
  [23, 23, 'Baja California Sur'],
  [24, 24, 'Campeche'],
  [25, 27, 'Coahuila'],
  [28, 28, 'Colima'],
  [29, 30, 'Chiapas'],
  [31, 33, 'Chihuahua'],
  [34, 35, 'Durango'],
  [36, 38, 'Guanajuato'],
  [39, 41, 'Guerrero'],
  [42, 43, 'Hidalgo'],
  [44, 49, 'Jalisco'],
  [50, 57, 'Estado de México'],
  [58, 61, 'Michoacán'],
  [62, 62, 'Morelos'],
  [63, 63, 'Nayarit'],
  [64, 67, 'Nuevo León'],
  [68, 71, 'Oaxaca'],
  [72, 75, 'Puebla'],
  [76, 76, 'Querétaro'],
  [77, 77, 'Quintana Roo'],
  [78, 79, 'San Luis Potosí'],
  [80, 82, 'Sinaloa'],
  [83, 85, 'Sonora'],
  [86, 86, 'Tabasco'],
  [87, 89, 'Tamaulipas'],
  [90, 90, 'Tlaxcala'],
  [91, 96, 'Veracruz'],
  [97, 97, 'Yucatán'],
  [98, 99, 'Zacatecas'],
];

export function isPostalCodeFormat(value: string): boolean {
  return /^\d{5}$/.test(value);
}

// The state for a well-formed postal code, or null when the prefix is not assigned to any state.
export function stateForPostalCode(postalCode: string): string | null {
  if (!isPostalCodeFormat(postalCode)) return null;
  const prefix = Number(postalCode.slice(0, 2));
  const match = STATE_RANGES.find(([from, to]) => prefix >= from && prefix <= to);
  return match ? match[2] : null;
}
