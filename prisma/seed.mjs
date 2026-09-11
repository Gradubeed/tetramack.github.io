import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

async function main() {
  const raw = readFileSync(path.join(__dirname, "seed-data.json"), "utf-8");
  const data = JSON.parse(raw);

  const existing = await prisma.config.findUnique({ where: { id: 1 } });
  if (existing) {
    console.log("La base contient déjà une configuration — seed ignoré (pour éviter d'écraser du contenu modifié).");
    console.log("Pour reseed depuis zéro : supprimer prisma/dev.db puis relancer `npx prisma migrate dev` et `npm run db:seed`.");
    return;
  }

  // Le mot de passe en clair du JSON de seed ne sert qu'à amorcer le tout premier déploiement :
  // il est haché ici puis jamais réutilisé. ADMIN_INITIAL_PASSWORD (env) prend le pas s'il est défini.
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || data.config.adminPassword;
  const adminPasswordHash = await bcrypt.hash(initialPassword, 12);

  await prisma.config.create({
    data: {
      id: 1,
      name: data.config.name,
      tagline: data.config.tagline,
      intro: data.config.intro,
      story: data.config.story,
      address: data.config.address,
      phone: data.config.phone,
      email: data.config.email,
      hours: data.config.hours,
      instagramUrl: data.config.instagramUrl || null,
      facebookUrl: data.config.facebookUrl || null,
      orderUrl: data.config.orderUrl || null,
      halalNote: data.config.halalNote || null,
      adminPasswordHash,
      mustChangePassword: true,
    },
  });
  console.log("Configuration créée.");

  for (const cat of data.categories) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn || null,
        parentId: cat.parentId || null,
        order: cat.order,
      },
    });
  }
  console.log(`${data.categories.length} catégories créées.`);

  // L'ordre d'affichage au sein d'une catégorie suit l'ordre d'apparition dans seed-data.json.
  const orderInCategory = new Map();
  for (const item of data.items) {
    const order = orderInCategory.get(item.categoryId) || 0;
    orderInCategory.set(item.categoryId, order + 1);
    await prisma.item.create({
      data: {
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        nameEn: item.nameEn || null,
        description: item.description || null,
        descriptionEn: item.descriptionEn || null,
        ingredients: item.ingredients || [],
        ingredientsEn: item.ingredientsEn || [],
        allergens: item.allergens || [],
        price: item.price || null,
        photos: item.photos || [],
        order,
      },
    });
  }
  console.log(`${data.items.length} plats créés.`);

  for (const n of data.news) {
    await prisma.news.create({
      data: {
        id: n.id,
        date: new Date(n.date),
        title: n.title,
        content: n.content,
      },
    });
  }
  console.log(`${data.news.length} actualités créées.`);

  console.log("\nSeed terminé.");
  console.log(`Mot de passe admin initial : ${initialPassword}`);
  console.log("Un changement de mot de passe sera exigé à la première connexion à /admin/login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
