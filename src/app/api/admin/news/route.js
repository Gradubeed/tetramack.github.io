import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

const NewsSchema = z.object({
  date: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(4000),
});

export async function GET() {
  const news = await prisma.news.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(news);
}

export async function POST(request) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const parsed = NewsSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { date, title, content } = parsed.data;
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "Date invalide." }, { status: 400 });
  }
  const news = await prisma.news.create({ data: { date: parsedDate, title, content } });
  return NextResponse.json(news, { status: 201 });
}
