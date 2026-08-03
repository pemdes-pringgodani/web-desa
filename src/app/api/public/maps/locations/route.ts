import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { serializeBigInt } from "../../../../../lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryIdStr = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const whereClause: any = {};

    if (categoryIdStr) {
      whereClause.mapCategoryId = BigInt(categoryIdStr);
    }

    if (search && search.trim()) {
      whereClause.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const locations = await prisma.mapLocation.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(serializeBigInt(locations));
  } catch (error: any) {
    console.error("Fetch map locations error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil lokasi penanda peta" },
      { status: 500 }
    );
  }
}
