import { NextResponse } from "next/server";
import { processAndSaveImage } from "@/lib/image";
import { requirePasswordChanged } from "@/lib/requirePasswordChanged";

const MAX_FILES = 8;

export async function POST(request) {
  const blocked = await requirePasswordChanged();
  if (blocked) return blocked;

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const files = form.getAll("files").filter((f) => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `${MAX_FILES} fichiers maximum par envoi.` }, { status: 400 });
  }

  const urls = [];
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const url = await processAndSaveImage(buffer);
      urls.push(url);
    } catch (err) {
      return NextResponse.json(
        { error: `Image "${file.name}" refusée : ${err.message}` },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ urls });
}
