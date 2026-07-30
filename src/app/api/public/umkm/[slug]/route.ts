import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { serializeBigInt } from "../../../../../lib/utils";

export async function GET(
  request: Request,
  context: { params: any }
) {
  try {
    const params = await context.params;
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug wajib diisi" },
        { status: 400 }
      );
    }

    // Fetch UMKM along with all its relations
    const umkm = await prisma.umkm.findUnique({
      where: { slug },
      include: {
        category: true,
        potential: true,
        galleries: true,
        products: true,
      },
    });

    if (!umkm) {
      return NextResponse.json(
        { error: "UMKM tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt(umkm),
    });
  } catch (error: any) {
    console.error("Get UMKM by slug API error:", error);
    return NextResponse.json(
      { error: `Terjadi kesalahan saat mengambil data: ${error.message}` },
      { status: 500 }
    );
  }
}