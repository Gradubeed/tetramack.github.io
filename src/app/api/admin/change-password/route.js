import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validatePassword } from "@/lib/auth";

const Schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export async function POST(request) {
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  const currentValid = await bcrypt.compare(currentPassword, config.adminPasswordHash);
  if (!currentValid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
  }

  const policyError = validatePassword(newPassword, {
    forbidden: ["tetramack2026", process.env.ADMIN_INITIAL_PASSWORD, currentPassword],
  });
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const adminPasswordHash = await bcrypt.hash(newPassword, 12);
  await prisma.config.update({
    where: { id: 1 },
    data: { adminPasswordHash, mustChangePassword: false },
  });

  return NextResponse.json({ ok: true });
}
