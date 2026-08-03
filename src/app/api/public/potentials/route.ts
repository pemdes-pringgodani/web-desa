import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { serializeBigInt } from "../../../../lib/utils";

export async function GET() {
  try {
    const potentials = await prisma.villagePotential.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(serializeBigInt(potentials));
  } catch (error: any) {
    console.error("Potentials API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil potensi desa" },
      { status: 500 }
    );
  }
}
