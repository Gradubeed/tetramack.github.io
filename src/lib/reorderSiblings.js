import { NextResponse } from "next/server";

/**
 * Déplace un enregistrement d'un cran vers le haut ou le bas parmi ses "frères" (même catégorie
 * parente pour les catégories, même catégorie pour les plats).
 *
 * Renumérote systématiquement tout le groupe de frères en 0..N-1 selon le nouvel ordre plutôt que
 * d'échanger seulement les deux valeurs `order` concernées : `order` a été rempli à la création à
 * partir d'un simple compteur de frères, donc des doublons peuvent apparaître après des
 * suppressions (ex: 3 plats 0/1/2, suppression du n°1, ajout d'un nouveau plat → il reprend la
 * valeur 2). Un simple swap sur des valeurs dupliquées serait un no-op silencieux ; renuméroter
 * systématiquement élimine ce cas sans avoir à détecter les doublons.
 *
 * @param model Le modèle Prisma (prisma.category ou prisma.item)
 * @param id Identifiant de l'enregistrement à déplacer
 * @param direction "up" | "down"
 * @param siblingWhere Clause `where` Prisma isolant le groupe de frères (ex: { parentId } ou { categoryId })
 */
export async function reorderSibling(model, id, direction, siblingWhere) {
  const siblings = await model.findMany({
    where: siblingWhere,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  });
  const index = siblings.findIndex((s) => s.id === id);
  if (index === -1) {
    return { error: NextResponse.json({ error: "Introuvable." }, { status: 404 }) };
  }
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    // Déjà en première/dernière position : rien à faire.
    return { updated: [] };
  }

  const reordered = [...siblings];
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

  const updated = await Promise.all(
    reordered.map((s, i) => (s.order === i ? s : model.update({ where: { id: s.id }, data: { order: i } })))
  );
  return { updated };
}
