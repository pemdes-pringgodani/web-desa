import { prisma } from "../../shared/db/client";

export class OfficialsRepository {
  static async getDefaultProfileId(): Promise<bigint> {
    const existingProfile = await prisma.villageProfile.findFirst({
      select: { id: true },
    });

    if (existingProfile) {
      return existingProfile.id;
    }

    // Auto-create a default Vision and Profile if none exists
    let vision = await prisma.villageVision.findFirst({ select: { id: true } });
    if (!vision) {
      vision = await prisma.villageVision.create({
        data: { vision: "Terwujudnya Desa yang Maju, Sejahtera, dan Berkelanjutan." },
        select: { id: true },
      });
    }

    const newProfile = await prisma.villageProfile.create({
      data: {
        villageVisionId: vision.id,
        structureImageUrl: "https://placehold.co/800x600?text=Struktur+Organisasi+Desa",
        address: "Jl. Raya Desa No. 1",
        phone: "081234567890",
        email: "info@desa.id",
      },
      select: { id: true },
    });

    return newProfile.id;
  }

  static async findAll(profileId?: bigint, searchQuery?: string) {
    const where: any = {};

    if (profileId) {
      where.villageProfileId = profileId;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { position: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    return prisma.villageOfficial.findMany({
      where,
      include: {
        villageProfile: {
          select: {
            id: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  static async findById(id: bigint) {
    return prisma.villageOfficial.findUnique({
      where: { id },
      include: {
        villageProfile: true,
      },
    });
  }

  static async create(data: {
    villageProfileId: bigint;
    name: string;
    position: string;
    photoUrl: string;
    email?: string | null;
    greeting?: string | null;
  }) {
    return prisma.villageOfficial.create({
      data,
    });
  }
}
