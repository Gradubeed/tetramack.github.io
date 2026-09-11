import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ALLERGEN_CODES } from "@/lib/allergens";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

const StringList = z.array(z.string().trim().min(1).max(200)).max(40);

const ItemSchema = z.object({
  categoryId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  descriptionEn: z.string().trim().max(2000).optional().or(z.literal("")),
  ingredients: StringList.optional().default([]),
  ingredientsEn: StringList.optional().default([]),
  allergens: z.array(z.enum(ALLERGEN_CODES)).max(ALLERGEN_CODES.length).optional().default([]),
  price: z.string().trim().max(30).optional().or(z.literal("")),
  photos: z.array(z.string().trim().min(1).max(2000)).max(12).optional().default([]),
});

export async function PATCH(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const parsed = ItemSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }
  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Plat introuvable." }, { status: 404 });
  }
  const data = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 400 });
  }

  const item = await prisma.item.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      name: data.name,
      nameEn: data.nameEn || null,
      description: data.description || null,
      descriptionEn: data.descriptionEn || null,
      ingredients: data.ingredients,
      ingredientsEn: data.ingredientsEn,
      allergens: data.allergens,
      price: data.price || null,
      photos: data.photos,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Plat introuvable." }, { status: 404 });
  }
  await prisma.item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
