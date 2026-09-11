import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";
import { reorderSibling } from "@/lib/reorderSiblings";

const Schema = z.object({ direction: z.enum(["up", "down"]) });

export async function POST(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const existing = await prisma.item.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Plat introuvable." }, { status: 404 });
  }

  const { updated, error } = await reorderSibling(prisma.item, id, parsed.data.direction, {
    categoryId: existing.categoryId,
  });
  if (error) return error;
  return NextResponse.json({ updated });
}
