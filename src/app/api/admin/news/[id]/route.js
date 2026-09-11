import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

const NewsSchema = z.object({
  date: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(4000),
});

export async function PATCH(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const parsed = NewsSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Actualité introuvable." }, { status: 404 });
  }
  const { date, title, content } = parsed.data;
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const news = await prisma.news.update({ where: { id }, data: { date: parsedDate, title, content } });
  return NextResponse.json(news);
}

export async function DELETE(request, { params }) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const { id } = await params;
  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Actualité introuvable." }, { status: 404 });
  }
  await prisma.news.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
