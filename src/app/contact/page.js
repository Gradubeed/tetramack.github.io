import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { getPublicConfig } from "@/lib/publicConfig";
import Eyebrow from "@/components/Eyebrow";
import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact — Tetra Mack & Co" };
// Contenu géré depuis l'admin : ne jamais mettre en cache statique, sinon les modifications
// (plats, actus, config) n'apparaîtraient qu'après un nouveau build.
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const config = await getPublicConfig();
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(config.address)}&output=embed`;

  return (
    <section className="tm-section">
      <Eyebrow>Contact</Eyebrow>
      <h2 className="font-display tm-page-title">Nous trouver</h2>
      <div className="tm-contact-grid">
        <ContactForm />
        <div className="tm-contact-side">
          <div className="tm-map-wrap">
            <iframe
              title="Localisation du restaurant"
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
          <div className="tm-contact-info">
            <p className="font-body"><MapPin size={14} /> {config.address}</p>
            <p className="font-body"><Phone size={14} /> {config.phone}</p>
            <p className="font-body"><Mail size={14} /> {config.email}</p>
            <p className="font-body tm-pre"><Clock size={14} /> {"\n"}{config.hours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
