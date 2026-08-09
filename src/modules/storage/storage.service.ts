import { createAdminClient } from "../../shared/supabase/server";
import { ValidationError, AppError } from "../../shared/errors/app-error";
import fs from "fs";
import path from "path";

export class StorageService {
  static async uploadFile(file: File | null) {
    console.log("=== DEBUG UPLOAD FILE ===");
    console.log("Type of file:", typeof file);
    console.log("Is instance of File:", file instanceof File);
    console.log("File name:", file?.name);
    console.log("File size:", file?.size, "bytes");
    console.log("File type:", file?.type);

    if (!file) {
      throw new ValidationError("Tidak ada file yang diunggah");
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      throw new ValidationError("Ukuran file maksimal adalah 10MB");
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError(
        "Format file tidak didukung. Harap unggah gambar (JPG, PNG, WEBP, atau GIF)"
      );
    }

    const storageProvider = process.env.STORAGE_PROVIDER || (process.env.NODE_ENV === "production" ? "supabase" : "local");

    const fileExtension = file.name.split(".").pop();
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${fileExtension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (storageProvider === "local") {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      
      // Create public/uploads folder if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueFileName);
      fs.writeFileSync(filePath, buffer);

      const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
      return { url: `${backendUrl}/uploads/${uniqueFileName}` };
    } else {
      const supabase = createAdminClient();
      const { error } = await supabase.storage
        .from("umkm")
        .upload(uniqueFileName, buffer, {
          contentType: file.type,
        });

      if (error) {
        throw new AppError(`Gagal mengunggah berkas: ${error.message}`, 500);
      }

      const { data: publicUrlData } = supabase.storage
        .from("umkm")
        .getPublicUrl(uniqueFileName);

      return { url: publicUrlData.publicUrl };
    }
  }
}
