import { createAdminClient } from "../../shared/supabase/server";
import { ValidationError, AppError } from "../../shared/errors/app-error";

export class StorageService {
  static async uploadFile(file: File | null) {
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const supabase = createAdminClient();

    const fileExtension = file.name.split(".").pop();
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${fileExtension}`;

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
