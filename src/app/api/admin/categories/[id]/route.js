import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

const UpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  nameEn: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function PATCH(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }
  const data = { ...parsed.data };
  if ("nameEn" in data) data.nameEn = data.nameEn || null;

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
  }
  // La suppression en cascade des sous-catégories et des plats associés est gérée
  // par les relations onDelete: Cascade du schéma Prisma.
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
