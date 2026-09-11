import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(4000),
  website: z.string().max(500).optional().default(""), // honeypot : un humain le laisse toujours vide
});

// Anti-spam minimal : throttle en mémoire par IP (suffisant pour un formulaire de contact
// à faible volume ; réinitialisé au redémarrage du serveur).
const lastSubmissionByIp = new Map();
const THROTTLE_MS = 30_000;

export async function POST(request) {
  const parsed = ContactSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  }
  const { name, email, message, website } = parsed.data;
  if (website) {
    // Honeypot rempli : probablement un bot. On répond succès sans rien envoyer.
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const last = lastSubmissionByIp.get(ip);
  if (last && Date.now() - last < THROTTLE_MS) {
    return NextResponse.json({ error: "Merci de patienter avant de renvoyer un message." }, { status: 429 });
  }

  const config = await prisma.config.findUnique({ where: { id: 1 } });
  if (!config) {
    return NextResponse.json({ error: "Configuration du site introuvable." }, { status: 500 });
  }

  try {
    await sendContactEmail({ to: config.email, name, email, message });
  } catch (err) {
    console.error("Échec de l'envoi de l'e-mail de contact :", err);
    return NextResponse.json({ error: "L'envoi du message a échoué. Merci de réessayer plus tard." }, { status: 502 });
  }

  lastSubmissionByIp.set(ip, Date.now());
  return NextResponse.json({ ok: true });
}
