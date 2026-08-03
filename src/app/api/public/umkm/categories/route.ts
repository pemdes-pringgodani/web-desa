import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { serializeBigInt } from "../../../../../lib/utils";

export async function GET() {
  try {
    const categories = await prisma.umkmCategory.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(serializeBigInt(categories));
  } catch (error: any) {
    console.error("Categories API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil kategori UMKM" },
      { status: 500 }
    );
  }
}
