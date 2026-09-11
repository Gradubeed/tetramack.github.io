import { Leaf } from "lucide-react";
import AllergenBadges from "@/components/AllergenBadges";
import DishCarousel from "@/components/DishCarousel";

export default function MenuItemRow({ item, align = "left", lang = "fr" }) {
  const photos = item.photos || [];
  const hasPhotos = photos.length > 0;

  const isEn = lang === "en";
  const displayName =
    isEn && item.nameEn && item.nameEn.trim() ? `${item.nameEn} - ${item.name}` : item.name;
  const displayDescription = isEn && item.descriptionEn ? item.descriptionEn : item.description;
  const displayIngredients =
    isEn && item.ingredientsEn && item.ingredientsEn.length > 0 ? item.ingredientsEn : item.ingredients;

  const text = (
    <div className="tm-menu-item-text">
      <div className="tm-menu-item-top">
        <h5 className="font-display">{displayName}</h5>
        <div className="tm-menu-item-dots" aria-hidden="true" />
        {item.price ? <span className="font-mono tm-menu-item-price">{item.price} €</span> : null}
      </div>
      {displayDescription && <p className="font-body tm-menu-item-desc">{displayDescription}</p>}
      {displayIngredients && displayIngredients.length > 0 && (
        <p className="font-body tm-menu-item-ingredients">
          <Leaf size={12} /> {displayIngredients.join(", ")}
        </p>
      )}
      <AllergenBadges codes={item.allergens} lang={lang} />
    </div>
  );

  if (!hasPhotos) {
    return <div className="tm-menu-item">{text}</div>;
  }

  return (
    <div className={`tm-menu-item tm-menu-item-media align-${align}`}>
      <div className="tm-menu-item-photo">
        <DishCarousel photos={photos} alt={item.name} />
      </div>
      {text}
    </div>
  );
}
