import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Bloque les routes d'écriture de l'admin (catégories, plats, actualités, config générale)
 * tant que le mot de passe par défaut n'a pas été changé — pas seulement côté UI, pour
 * qu'une session admin volée ne puisse pas contourner la modale obligatoire en appelant
 * l'API directement (cahier des charges §2.1.3).
 */
export async function requirePasswordChanged() {
  const config = await prisma.config.findUnique({ where: { id: 1 }, select: { mustChangePassword: true } });
  if (config?.mustChangePassword) {
    return NextResponse.json(
      { error: "Vous devez changer le mot de passe par défaut avant toute autre action." },
      { status: 403 }
    );
  }
  return null;
}
