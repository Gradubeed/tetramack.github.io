export const ALLERGENS = [
  { code: "gluten", label: "Gluten", labelEn: "Gluten" },
  { code: "crustaces", label: "Crustacés", labelEn: "Crustaceans" },
  { code: "oeufs", label: "Œufs", labelEn: "Eggs" },
  { code: "poissons", label: "Poissons", labelEn: "Fish" },
  { code: "arachides", label: "Arachides", labelEn: "Peanuts" },
  { code: "soja", label: "Soja", labelEn: "Soybeans" },
  { code: "lait", label: "Lait", labelEn: "Milk" },
  { code: "fruitsacoque", label: "Fruits à coque", labelEn: "Tree nuts" },
  { code: "celeri", label: "Céleri", labelEn: "Celery" },
  { code: "moutarde", label: "Moutarde", labelEn: "Mustard" },
  { code: "sesame", label: "Sésame", labelEn: "Sesame" },
  { code: "sulfites", label: "Sulfites", labelEn: "Sulphites" },
  { code: "lupin", label: "Lupin", labelEn: "Lupin" },
  { code: "mollusques", label: "Mollusques", labelEn: "Molluscs" },
];

export const ALLERGEN_CODES = ALLERGENS.map((a) => a.code);

export function allergenLabel(code, lang = "fr") {
  const a = ALLERGENS.find((a) => a.code === code);
  if (!a) return code;
  return lang === "en" ? a.labelEn : a.label;
}
