// Kericho County: 6 constituencies, 30 county assembly wards (IEBC).
export const OUTSIDE = "Outside Kericho County";
export const KERICHO: Record<string, string[]> = {
  "Ainamoi": ["Kapsoit", "Ainamoi", "Kapkugerwet", "Kipchebor", "Kipchimchim", "Kapsaos"],
  "Belgut": ["Waldai", "Kabianga", "Cheptororiet/Seretut", "Chaik", "Kapsuser"],
  "Bureti": ["Kisiara", "Tebesonik", "Cheboin", "Chemosot", "Litein", "Cheplanget", "Kapkatet"],
  "Kipkelion East": ["Londiani", "Kedowa/Kimugul", "Chepseon", "Tendeno/Sorget"],
  "Kipkelion West": ["Kipkelion", "Kunyak", "Kamasian", "Chilchila"],
  "Sigowet/Soin": ["Sigowet", "Kaplelartet", "Soliat", "Soin"],
};
export function validateLocation(constituency: string, ward: string) {
  if (constituency === OUTSIDE) return ward && ward.length <= 80 ? { constituency, ward } : null;
  return KERICHO[constituency]?.includes(ward) ? { constituency, ward } : null;
}
