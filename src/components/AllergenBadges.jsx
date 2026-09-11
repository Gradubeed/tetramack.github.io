import { allergenLabel } from "@/lib/allergens";

export default function AllergenBadges({ codes, lang = "fr" }) {
  if (!codes || codes.length === 0) return null;
  return (
    <div className="tm-allergens">
      {codes.map((c) => (
        <span key={c} className="tm-allergen-chip font-mono">
          {allergenLabel(c, lang)}
        </span>
      ))}
    </div>
  );
}
