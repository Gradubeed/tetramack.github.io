import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 Mo par fichier
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 78;

/**
 * Valide et traite une image uploadée côté serveur : ne fait jamais confiance au
 * type MIME déclaré par le client, ni à l'extension du fichier. sharp lit les
 * octets réels ; s'ils ne décrivent pas une image valide, il lève une erreur.
 */
export async function processAndSaveImage(fileBuffer) {
  if (fileBuffer.length > MAX_FILE_BYTES) {
    throw new Error("Image trop volumineuse (8 Mo maximum).");
  }

  const image = sharp(fileBuffer, { failOn: "error" });
  const metadata = await image.metadata();
  if (!metadata.format || !["jpeg", "png", "webp", "avif", "gif"].includes(metadata.format)) {
    throw new Error("Format d'image non supporté.");
  }

  const output = await image
    .rotate() // applique l'orientation EXIF puis la supprime
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.jpg`;
  await writeFile(path.join(UPLOAD_DIR, filename), output);

  return `/uploads/${filename}`;
}
