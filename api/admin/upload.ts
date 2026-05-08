import type { VercelRequest, VercelResponse } from "@vercel/node";
import { IncomingForm, type File } from "formidable";
import { readFileSync } from "fs";
import { requireAdmin } from "../_lib/auth";
import { getServiceClient } from "../_lib/supabase";
import { logAudit } from "../_lib/audit";

const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
];

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!requireAdmin(req, res)) return;

  try {
    const form = new IncomingForm({ maxFileSize: 50 * 1024 * 1024 });

    const files = await new Promise<Record<string, File[]>>(
      (resolve, reject) => {
        form.parse(req as any, (err, _fields, files) => {
          if (err) reject(err);
          else resolve(files as Record<string, File[]>);
        });
      }
    );

    const fileArray = files.file;
    if (!fileArray || fileArray.length === 0) {
      return res.status(400).json({ error: "bad_request", message: "Aucun fichier fourni" });
    }

    const file = fileArray[0];
    const mimeType = file.mimetype ?? "";

    if (!ALLOWED_MIMES.includes(mimeType)) {
      return res.status(400).json({
        error: "invalid_mime",
        message: `Type de fichier non autorisé: ${mimeType}`,
      });
    }

    const ext = EXT_MAP[mimeType] ?? "bin";
    const originalName = file.originalFilename ?? "upload";
    const slug = slugify(originalName.replace(/\.[^.]+$/, ""));
    const storagePath = `uploads/${Date.now()}-${slug}.${ext}`;

    const buffer = readFileSync(file.filepath);

    const { error: uploadError } = await getServiceClient()
      .storage
      .from("coco-beach-public")
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const supabaseUrl = process.env.SUPABASE_URL;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/coco-beach-public/${storagePath}`;

    logAudit("file_uploaded", { storagePath, mimeType, size: file.size }, req);

    return res.status(200).json({ storage_path: storagePath, public_url: publicUrl });
  } catch (err) {
    console.error("[api/admin/upload] error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
}
