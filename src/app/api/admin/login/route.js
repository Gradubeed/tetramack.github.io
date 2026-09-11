import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie } from "@/lib/auth";
import { isLocked, lockRemainingMinutes, nextStateAfterFailure, stateAfterSuccess } from "@/lib/loginLock";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) {
    return NextResponse.json({ error: "Configuration introuvable." }, { status: 500 });
  }

  if (isLocked(config)) {
    return NextResponse.json(
      { error: `Trop de tentatives échouées. Réessayez dans ${lockRemainingMinutes(config)} min.` },
      { status: 429 }
    );
  }

  const valid = password ? await bcrypt.compare(password, config.adminPasswordHash) : false;

  if (!valid) {
    const next = nextStateAfterFailure(config);
    await prisma.config.update({ where: { id: 1 }, data: next });
    if (next.lockedUntil) {
      return NextResponse.json(
        { error: "Trop de tentatives échouées. Compte verrouillé 15 minutes." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await prisma.config.update({ where: { id: 1 }, data: stateAfterSuccess });

  const token = await createSessionToken();
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, mustChangePassword: config.mustChangePassword });
}
