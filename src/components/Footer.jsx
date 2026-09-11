import Link from "next/link";
import { Phone, Mail, Lock } from "lucide-react";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";

export default function Footer({ config }) {
  return (
    <footer className="tm-footer">
      <div className="tm-footer-inner">
        <div className="tm-footer-col">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt={config.name} className="tm-footer-logo" />
          <p className="font-body tm-footer-tagline">{config.tagline}</p>
        </div>
        <div className="tm-footer-col">
          <span className="font-mono tm-footer-heading">Adresse</span>
          <p className="font-body">{config.address}</p>
          <span className="font-mono tm-footer-heading">Horaires</span>
          <p className="font-body tm-pre">{config.hours}</p>
        </div>
        <div className="tm-footer-col">
          <span className="font-mono tm-footer-heading">Contact</span>
          <p className="font-body"><Phone size={14} /> {config.phone}</p>
          <p className="font-body"><Mail size={14} /> {config.email}</p>
          <div className="tm-social-row">
            {config.instagramUrl && (
              <a href={config.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
            )}
            {config.facebookUrl && (
              <a href={config.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
                <FacebookIcon size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="tm-footer-bottom">
        <span className="font-mono">
          © {new Date().getFullYear()} {config.name}
        </span>
        <Link href="/admin/login" className="tm-admin-link font-mono">
          <Lock size={12} /> Espace professionnel
        </Link>
      </div>
    </footer>
  );
}
