"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuIcon, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/menu", label: "Menu" },
  { href: "/news", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ config }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="tm-header">
      <div className="tm-header-inner">
        <Link href="/" className="tm-brand" aria-label="Accueil" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt={config.name} className="tm-brand-logo" />
          <span className="tm-brand-text font-display">{config.name}</span>
        </Link>
        <nav className="tm-nav-desktop">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`tm-nav-link font-mono ${pathname === n.href ? "is-active" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <button className="tm-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>
      {open && (
        <div className="tm-nav-mobile">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`tm-nav-link-mobile font-mono ${pathname === n.href ? "is-active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
