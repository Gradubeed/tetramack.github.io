import { ExternalLink, ShoppingBag, Newspaper } from "lucide-react";
import { prisma } from "@/lib/db";
import { getPublicConfig } from "@/lib/publicConfig";
import Eyebrow from "@/components/Eyebrow";
import { InstagramIcon, FacebookIcon } from "@/components/icons/SocialIcons";

export const metadata = { title: "Actualités — Tetra Mack & Co" };
// Contenu géré depuis l'admin : ne jamais mettre en cache statique, sinon les modifications
// (plats, actus, config) n'apparaîtraient qu'après un nouveau build.
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [config, news] = await Promise.all([
    getPublicConfig(),
    prisma.news.findMany({ orderBy: { date: "desc" } }),
  ]);

  return (
    <section className="tm-section">
      <Eyebrow>Réseaux & actualités</Eyebrow>
      <h2 className="font-display tm-page-title">Ce qui se passe chez nous</h2>

      <div className="tm-social-cards">
        {config.instagramUrl && (
          <a className="tm-social-card" href={config.instagramUrl} target="_blank" rel="noreferrer">
            <InstagramIcon size={22} />
            <span className="font-mono">Instagram</span>
            <ExternalLink size={14} />
          </a>
        )}
        {config.facebookUrl && (
          <a className="tm-social-card" href={config.facebookUrl} target="_blank" rel="noreferrer">
            <FacebookIcon size={22} />
            <span className="font-mono">Facebook</span>
            <ExternalLink size={14} />
          </a>
        )}
        {config.orderUrl && (
          <a className="tm-social-card" href={config.orderUrl} target="_blank" rel="noreferrer">
            <ShoppingBag size={22} />
            <span className="font-mono">Commander en ligne</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="tm-news-list">
        {news.length === 0 && <p className="font-body tm-empty">Aucune actualité pour le moment.</p>}
        {news.map((n) => (
          <article key={n.id} className="tm-news-item">
            <div className="tm-news-date-col">
              <Newspaper size={16} />
              <span className="font-mono">
                {new Date(n.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
            <div>
              <h3 className="font-display tm-news-title">{n.title}</h3>
              <p className="font-body">{n.content}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
