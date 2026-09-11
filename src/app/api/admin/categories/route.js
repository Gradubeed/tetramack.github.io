import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().max(200).optional().or(z.literal("")),
  parentId: z.string().trim().max(100).optional().or(z.literal("")).nullable(),
});

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(request) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const parsed = CreateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { name, nameEn, parentId } = parsed.data;
  const normalizedParentId = parentId || null;

  if (normalizedParentId) {
    const parent = await prisma.category.findUnique({ where: { id: normalizedParentId } });
    if (!parent) {
      return NextResponse.json({ error: "Catégorie parente introuvable." }, { status: 400 });
    }
    if (parent.parentId) {
      return NextResponse.json(
        { error: "Un seul niveau de sous-catégorie est autorisé." },
        { status: 400 }
      );
    }
  }

  const siblingCount = await prisma.category.count({ where: { parentId: normalizedParentId } });
  const category = await prisma.category.create({
    data: {
      name,
      nameEn: nameEn || null,
      parentId: normalizedParentId,
      order: siblingCount,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
