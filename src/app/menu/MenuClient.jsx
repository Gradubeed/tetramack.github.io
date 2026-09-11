"use client";

import { useState } from "react";
import Eyebrow from "@/components/Eyebrow";
import Seal from "@/components/Seal";
import MenuItemRow from "@/components/MenuItemRow";

export default function MenuClient({ config, categories, items }) {
  const [lang, setLang] = useState("fr");
  const topCats = categories.filter((c) => !c.parentId).sort((a, b) => a.order - b.order);
  const subCatsOf = (id) =>
    categories.filter((c) => c.parentId === id).sort((a, b) => a.order - b.order);
  const itemsOf = (catId) => items.filter((i) => i.categoryId === catId);

  /* Compteur global sur toute la page pour que l'alignement des photos alterne
     d'un plat à l'autre, à travers catégories et sous-catégories. */
  let sideCounter = 0;
  const nextAlign = () => (sideCounter++ % 2 === 0 ? "left" : "right");

  return (
    <section className="tm-section">
      <Eyebrow>Le menu</Eyebrow>
      <div className="tm-lang-toggle-row">
        <div className="tm-lang-toggle" role="group" aria-label="Langue de la carte">
          <button
            type="button"
            className={`font-mono tm-lang-btn ${lang === "fr" ? "is-active" : ""}`}
            onClick={() => setLang("fr")}
          >
            FR
          </button>
          <button
            type="button"
            className={`font-mono tm-lang-btn ${lang === "en" ? "is-active" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>
      <div className="tm-menu-header">
        <h2 className="font-display tm-page-title">Notre carte</h2>
        {config?.halalNote && (
          <div className="tm-halal-badge">
            <span className="font-mono tm-halal-badge-text">{config.halalNote}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/halal-logo.png" alt="Halal" className="tm-halal-badge-logo" />
          </div>
        )}
      </div>
      {topCats.length === 0 && (
        <p className="font-body tm-empty">Le menu est en cours de préparation.</p>
      )}
      {topCats.map((cat) => {
        const subs = subCatsOf(cat.id);
        const directItems = itemsOf(cat.id);
        const catLabel = lang === "en" && cat.nameEn ? cat.nameEn : cat.name;
        return (
          <div key={cat.id} className="tm-menu-cat">
            <div className="tm-menu-cat-heading">
              <Seal size={26} />
              <h3 className="font-display">{catLabel}</h3>
            </div>
            {directItems.length > 0 && (
              <div className="tm-menu-items">
                {directItems.map((it) => (
                  <MenuItemRow key={it.id} item={it} align={nextAlign()} lang={lang} />
                ))}
              </div>
            )}
            {subs.map((sub) => {
              const subItems = itemsOf(sub.id);
              if (subItems.length === 0) return null;
              const subLabel = lang === "en" && sub.nameEn ? sub.nameEn : sub.name;
              return (
                <div key={sub.id} className="tm-menu-subcat">
                  <h4 className="font-mono tm-menu-subcat-title">{subLabel}</h4>
                  <div className="tm-menu-items">
                    {subItems.map((it) => (
                      <MenuItemRow key={it.id} item={it} align={nextAlign()} lang={lang} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
