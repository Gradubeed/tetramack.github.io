import Link from "next/link";
import { MapPin, Clock, Phone, ChevronRight } from "lucide-react";
import { getPublicConfig } from "@/lib/publicConfig";
import Eyebrow from "@/components/Eyebrow";
import Seal from "@/components/Seal";

// Contenu géré depuis l'admin : ne jamais mettre en cache statique, sinon les modifications
// (plats, actus, config) n'apparaîtraient qu'après un nouveau build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getPublicConfig();

  return (
    <>
      <section className="tm-hero">
        <div className="tm-hero-glow" aria-hidden="true" />
        <div className="tm-hero-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt={config.name} className="tm-hero-logo" />
          <h1 className="font-display tm-hero-title">{config.name}</h1>
          <p className="font-mono tm-hero-tagline">{config.tagline}</p>
          <p className="font-body tm-hero-intro">{config.intro}</p>
          <div className="tm-hero-actions">
            <Link href="/menu" className="tm-btn tm-btn-gold">
              Voir le menu <ChevronRight size={16} />
            </Link>
            <Link href="/contact" className="tm-btn tm-btn-ghost">
              Réserver / Nous trouver
            </Link>
          </div>
        </div>
      </section>

      <section className="tm-section">
        <Eyebrow>Notre histoire</Eyebrow>
        <div className="tm-story">
          <p className="font-body tm-story-text">{config.story}</p>
          <div className="tm-story-side">
            <Seal size={54} />
            <p className="font-mono tm-story-side-text">
              Fusion asiatique
              <br />
              Produits de saison
              <br />
              Cuisine ouverte
            </p>
          </div>
        </div>
      </section>

      <section className="tm-section tm-section-alt">
        <Eyebrow>Informations pratiques</Eyebrow>
        <div className="tm-infogrid">
          <div className="tm-infocard">
            <MapPin size={20} />
            <span className="font-mono tm-infocard-heading">Adresse</span>
            <p className="font-body">{config.address}</p>
          </div>
          <div className="tm-infocard">
            <Clock size={20} />
            <span className="font-mono tm-infocard-heading">Horaires</span>
            <p className="font-body tm-pre">{config.hours}</p>
          </div>
          <div className="tm-infocard">
            <Phone size={20} />
            <span className="font-mono tm-infocard-heading">Réservation</span>
            <p className="font-body">{config.phone}</p>
          </div>
        </div>
      </section>
    </>
  );
}
