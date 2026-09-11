import { prisma } from "@/lib/db";
import { getPublicConfig } from "@/lib/publicConfig";
import MenuClient from "./MenuClient";

export const metadata = { title: "Menu — Tetra Mack & Co" };
// Contenu géré depuis l'admin : ne jamais mettre en cache statique, sinon les modifications
// (plats, actus, config) n'apparaîtraient qu'après un nouveau build.
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [config, categories, items] = await Promise.all([
    getPublicConfig(),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.item.findMany({ orderBy: { order: "asc" } }),
  ]);

  return <MenuClient config={config} categories={categories} items={items} />;
}
