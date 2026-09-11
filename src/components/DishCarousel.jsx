"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DishCarousel({ photos, alt }) {
  const [idx, setIdx] = useState(0);
  const prev = (e) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + photos.length) % photos.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % photos.length);
  };
  return (
    <div className="tm-carousel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[idx]} alt={alt} loading="lazy" />
      {photos.length > 1 && (
        <>
          <button className="tm-carousel-btn tm-carousel-prev" onClick={prev} aria-label="Photo précédente">
            <ChevronLeft size={16} />
          </button>
          <button className="tm-carousel-btn tm-carousel-next" onClick={next} aria-label="Photo suivante">
            <ChevronRight size={16} />
          </button>
          <div className="tm-carousel-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`tm-carousel-dot ${i === idx ? "is-active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
