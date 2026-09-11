import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // Cette route est protégée par le middleware (session admin requise).
  const config = await prisma.config.findUnique({ where: { id: 1 } });
  return NextResponse.json({ mustChangePassword: config.mustChangePassword });
}
