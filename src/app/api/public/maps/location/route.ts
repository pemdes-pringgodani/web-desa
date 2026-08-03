import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { serializeBigInt } from "../../../../../lib/utils";
import { z } from "zod";

// Zod schema for input validation
const mapLocationSchema = z.object({
  mapCategoryId: z.string().or(z.number()),
  name: z.string().min(3, "Nama lokasi minimal 3 karakter").max(256),
  shortDescription: z.string().max(156).optional().nullable(),
  imageUrl: z.string().max(256).optional().nullable(),
  address: z.string().max(256).optional().nullable(),
  latitude: z.number(),
  longitude: z.number(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = mapLocationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      mapCategoryId,
      name,
      shortDescription,
      imageUrl,
      address,
      latitude,
      longitude,
    } = validation.data;

    // Verify map category exists
    const categoryId = BigInt(mapCategoryId);
    const categoryExists = await prisma.mapCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Kategori peta tidak ditemukan" },
        { status: 404 }
      );
    }

    // Save map location to DB
    const newLocation = await prisma.mapLocation.create({
      data: {
        mapCategoryId: categoryId,
        name,
        shortDescription: shortDescription || null,
        imageUrl: imageUrl || null,
        address: address || null,
        latitude,
        longitude,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Penanda lokasi berhasil disimpan!",
      data: serializeBigInt(newLocation),
    });
  } catch (error: any) {
    console.error("Save map location error:", error);
    return NextResponse.json(
      { error: `Gagal menyimpan lokasi penanda: ${error.message}` },
      { status: 500 }
    );
  }
}
