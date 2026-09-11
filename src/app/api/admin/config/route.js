import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getPublicConfig } from "@/lib/publicConfig";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

// Champs éditables depuis "Général" — jamais adminPasswordHash / mustChangePassword ici
// (gérés exclusivement par /api/admin/change-password).
const Schema = z.object({
  name: z.string().trim().min(1).max(200),
  tagline: z.string().trim().max(300),
  intro: z.string().trim().max(4000),
  story: z.string().trim().max(4000),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().max(60),
  email: z.string().trim().email().max(200),
  hours: z.string().trim().max(2000),
  instagramUrl: z.string().trim().max(300).optional().or(z.literal("")),
  facebookUrl: z.string().trim().max(300).optional().or(z.literal("")),
  orderUrl: z.string().trim().max(300).optional().or(z.literal("")),
  halalNote: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function GET() {
  const config = await getPublicConfig();
  return NextResponse.json(config);
}

export async function PATCH(request) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const data = parsed.data;
  await prisma.config.update({
    where: { id: 1 },
    data: {
      ...data,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      orderUrl: data.orderUrl || null,
      halalNote: data.halalNote || null,
    },
  });
  return NextResponse.json({ ok: true });
}
