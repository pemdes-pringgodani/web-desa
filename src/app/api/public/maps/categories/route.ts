import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { serializeBigInt } from "../../../../../lib/utils";

export async function GET() {
  try {
    let categories = await prisma.mapCategory.findMany({
      orderBy: { name: "asc" },
    });

    // Auto-seed if category table is empty
    if (categories.length === 0) {
      const defaultCategories = [
        { name: "Kantor Pemerintahan", slug: "kantor-pemerintahan", icon: "🏛️", color: "#3B82F6" }, // Blue
        { name: "Fasilitas Kesehatan", slug: "fasilitas-kesehatan", icon: "🏥", color: "#EF4444" }, // Red
        { name: "Sarana Ibadah", slug: "sarana-ibadah", icon: "🕌", color: "#10B981" }, // Green
        { name: "Pendidikan", slug: "pendidikan", icon: "🏫", color: "#F59E0B" }, // Yellow
        { name: "Tempat Wisata", slug: "tempat-wisata", icon: "🌳", color: "#8B5CF6" }, // Purple
        { name: "UMKM & Perdagangan", slug: "umkm-perdagangan", icon: "🛍️", color: "#EC4899" }, // Pink
      ];

      await prisma.mapCategory.createMany({
        data: defaultCategories,
      });

      categories = await prisma.mapCategory.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(serializeBigInt(categories));
  } catch (error: any) {
    console.error("Fetch map categories error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil kategori peta" },
      { status: 500 }
    );
  }
}
