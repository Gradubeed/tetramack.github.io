import { prisma } from "@/lib/db";

// Ne JAMAIS renvoyer adminPasswordHash / mustChangePassword / failedLoginAttempts / lockedUntil
// depuis cette fonction : son résultat est transmis à des Server puis Client Components et finit
// sérialisé dans le payload envoyé au navigateur de n'importe quel visiteur du site public.
const PUBLIC_CONFIG_SELECT = {
  name: true,
  tagline: true,
  intro: true,
  story: true,
  address: true,
  phone: true,
  email: true,
  hours: true,
  instagramUrl: true,
  facebookUrl: true,
  orderUrl: true,
  halalNote: true,
};

export async function getPublicConfig() {
  const config = await prisma.config.findUnique({ where: { id: 1 }, select: PUBLIC_CONFIG_SELECT });
  if (!config) {
    throw new Error(
      "Aucune configuration trouvée en base. Lance `npm run db:seed` pour initialiser le site."
    );
  }
  return config;
}
