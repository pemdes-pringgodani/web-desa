import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diunggah" },
        { status: 400 }
      );
    }

    // 1. Validasi Ukuran File (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file maksimal adalah 10MB" },
        { status: 400 }
      );
    }

    // 2. Validasi Tipe File (hanya gambar)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Harap unggah gambar (JPG, PNG, WEBP, atau GIF)" },
        { status: 400 }
      );
    }

    // 3. Konversi file ke Buffer untuk diunggah ke Supabase
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Inisialisasi Admin Client Supabase
    const supabase = createAdminClient();

    // 5. Buat nama file unik (timestamp + original name)
    const fileExtension = file.name.split(".").pop();
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const uniqueFileName = `${Date.now()}_${cleanFileName}.${fileExtension}`;

    // 6. Unggah ke bucket 'umkm' di Supabase Storage
    const { error } = await supabase.storage
      .from("umkm")
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json(
        { error: `Gagal mengunggah berkas: ${error.message}` },
        { status: 500 }
      );
    }

    // 7. Ambil URL Publik
    const { data: publicUrlData } = supabase.storage
      .from("umkm")
      .getPublicUrl(uniqueFileName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}
