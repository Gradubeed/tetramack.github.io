import "./globals.css";
import { getPublicConfig } from "@/lib/publicConfig";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tetra Mack & Co — Asian Fusion Food",
  description:
    "Tetra Mack & Co, restaurant asiatique fusion halal à Reims. Découvrez notre carte, nos actualités et réservez votre table.",
};

export default async function RootLayout({ children }) {
  const config = await getPublicConfig();

  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <div className="tm-app">
          <Header config={config} />
          {children}
          <ConditionalFooter config={config} />
        </div>
      </body>
    </html>
  );
}
