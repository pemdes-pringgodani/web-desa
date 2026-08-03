import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { serializeBigInt, generateUmkmSlug, generateCategorySlug, generatePotentialSlug } from "../../../../../lib/utils";
import { z } from "zod";

// 1. Zod validation schemas
const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().min(1, "Deskripsi produk wajib diisi"),
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().nullable().optional()
  ),
  imageUrl: z.string().nullable().optional(),
});

const registerSchema = z.object({
  name: z.string().min(1, "Nama UMKM wajib diisi"),
  ownerName: z.string().min(1, "Nama pemilik wajib diisi"),
  umkmCategoryId: z.preprocess(
    (val) => String(val),
    z.string().min(1, "Kategori UMKM wajib dipilih")
  ),
  newCategoryName: z.string().optional().nullable(),
  villagePotentialId: z.preprocess(
    (val) => (val ? String(val) : null),
    z.string().nullable().optional()
  ),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  phone: z.string().min(1, "Nomor WhatsApp wajib diisi"),
  email: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().email("Format email tidak valid").nullable().optional()
  ),
  coverUrl: z.string().min(1, "Cover wajib diunggah"),
  address: z.string().min(1, "Alamat wajib diisi"),
  latitude: z.preprocess(
    (val) => Number(val),
    z.number({ message: "Koordinat Latitude wajib diisi" })
  ),
  longitude: z.preprocess(
    (val) => Number(val),
    z.number({ message: "Koordinat Longitude wajib diisi" })
  ),
  googlePlaceId: z.string().nullable().optional(),
  since: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().nullable().optional()
  ),
  openDay: z.string().nullable().optional(),
  startTime: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam buka tidak valid (HH:MM)").nullable().optional()
  ),
  endTime: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tutup tidak valid (HH:MM)").nullable().optional()
  ),
  galleries: z.array(z.string()).optional(),
  products: z.array(productSchema).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 2. Validate input fields using Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Additional validations for 'other' options
    if (data.umkmCategoryId === "other" && (!data.newCategoryName || !data.newCategoryName.trim())) {
      return NextResponse.json(
        { error: "Nama kategori baru wajib diisi jika memilih Lainnya" },
        { status: 400 }
      );
    }

    // 3. Process the transaction
    const result = await prisma.$transaction(async (tx) => {
      // a. Handle custom category creation
      let finalCategoryId: bigint;
      if (data.umkmCategoryId === "other") {
        const cleanedName = data.newCategoryName!.trim();
        const existingCat = await tx.umkmCategory.findFirst({
          where: { name: { equals: cleanedName, mode: "insensitive" } },
        });

        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const catSlug = await generateCategorySlug(cleanedName, tx);
          const newCat = await tx.umkmCategory.create({
            data: {
              name: cleanedName,
              slug: catSlug,
            },
          });
          finalCategoryId = newCat.id;
        }
      } else {
        finalCategoryId = BigInt(data.umkmCategoryId);
      }

      // b. Handle potential selection (strictly from existing ones)
      const finalPotentialId = data.villagePotentialId ? BigInt(data.villagePotentialId) : null;

      // c. Generate unique slug
      const slug = await generateUmkmSlug(data.name, tx);

      // d. Insert UMKM main profile
      const umkm = await tx.umkm.create({
        data: {
          name: data.name,
          ownerName: data.ownerName,
          umkmCategoryId: finalCategoryId,
          villagePotentialId: finalPotentialId,
          description: data.description,
          phone: data.phone,
          email: data.email || null,
          coverUrl: data.coverUrl,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          googlePlaceId: data.googlePlaceId || null,
          since: data.since,
          openDay: data.openDay || null,
          startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}:00Z`) : null,
          endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}:00Z`) : null,
          status: "PENDING",
          slug,
        },
      });

      // c. Insert galleries if present
      if (data.galleries && data.galleries.length > 0) {
        await tx.umkmGallery.createMany({
          data: data.galleries.map((url) => ({
            umkmId: umkm.id,
            imageUrl: url,
          })),
        });
      }

      // d. Insert products if present
      if (data.products && data.products.length > 0) {
        await tx.product.createMany({
          data: data.products.map((prod) => ({
            umkmId: umkm.id,
            name: prod.name,
            description: prod.description,
            price: prod.price,
            imageUrl: prod.imageUrl || null,
          })),
        });
      }

      return umkm;
    });

    return NextResponse.json({
      success: true,
      message: "UMKM berhasil didaftarkan dan menunggu verifikasi admin.",
      data: serializeBigInt(result),
    });
  } catch (error: any) {
    console.error("Register UMKM API error:", error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat memproses pendaftaran: ${error.message}` },
      { status: 500 }
    );
  }
}
