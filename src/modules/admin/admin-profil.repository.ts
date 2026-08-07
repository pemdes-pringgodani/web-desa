import { prisma } from "../../shared/db/client";

export class AdminProfilRepository {
  static async getVillageProfile() {
    const profile = await prisma.villageProfile.findFirst({
      include: {
        vision: {
          include: {
            missions: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        officials: true,
        histories: {
          include: {
            details: true,
          },
        },
      },
    });

    if (!profile) {
      return {
        headName: "Ki Suryo Pringgo",
        headPosition: "Kepala Desa Pringgodani",
        headPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        headGreeting: "Selamat datang di website resmi Desa Pringgodani.",
        historyText: "Desa Pringgodani berdiri sejak masa kolonial...",
        vision: "Mewujudkan Desa Pringgodani yang mandiri, maju, dan sejahtera.",
        missions: ["Meningkatkan kualitas pelayanan publik berbasis digital", "Mendorong UMKM desa"],
        structureImageUrl: "https://images.unsplash.com/photo-1542744801-43245f175232?auto=format&fit=crop&w=1200&q=80",
        officials: [],
      };
    }

    const firstOfficial = profile.officials[0];

    return {
      headName: firstOfficial?.name || "Ki Suryo Pringgo",
      headPosition: firstOfficial?.position || "Kepala Desa",
      headPhoto: firstOfficial?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      headGreeting: firstOfficial?.greeting || "Selamat datang di website resmi Desa Pringgodani.",
      historyText: profile.histories[0]?.details[0]?.content || "Desa Pringgodani berdiri sejak masa kolonial...",
      vision: profile.vision?.vision || "Mewujudkan Desa Pringgodani yang mandiri, maju, dan sejahtera.",
      missions: profile.vision?.missions.map((m) => m.mission) || [],
      structureImageUrl: profile.structureImageUrl || "",
      officials: profile.officials.map((o) => ({
        id: o.id.toString(),
        name: o.name,
        position: o.position,
        photoUrl: o.photoUrl,
        email: o.email || undefined,
        greeting: o.greeting || undefined,
      })),
    };
  }

  static async updateVillageProfile(payload: any) {
    const profile = await prisma.villageProfile.findFirst();

    if (profile) {
      if (payload.structureImageUrl) {
        await prisma.villageProfile.update({
          where: { id: profile.id },
          data: {
            structureImageUrl: payload.structureImageUrl,
          },
        });
      }

      if (payload.vision && profile.villageVisionId) {
        await prisma.villageVision.update({
          where: { id: profile.villageVisionId },
          data: { vision: payload.vision },
        });
      }
    }

    return { success: true };
  }

  static async addOfficial(payload: any) {
    const profile = await prisma.villageProfile.findFirst();
    if (!profile) throw new Error("Profile desa belum diinisialisasi");

    const created = await prisma.villageOfficial.create({
      data: {
        villageProfileId: profile.id,
        name: payload.name,
        position: payload.position,
        photoUrl: payload.photoUrl || "",
        email: payload.email || null,
        greeting: payload.greeting || null,
      },
    });

    return {
      id: created.id.toString(),
      name: created.name,
      position: created.position,
      photoUrl: created.photoUrl,
      email: created.email || undefined,
    };
  }

  static async updateOfficial(id: string, payload: any) {
    const officialId = BigInt(id);
    const updated = await prisma.villageOfficial.update({
      where: { id: officialId },
      data: {
        name: payload.name,
        position: payload.position,
        photoUrl: payload.photoUrl,
        email: payload.email || null,
        greeting: payload.greeting || null,
      },
    });

    return {
      id: updated.id.toString(),
      name: updated.name,
      position: updated.position,
      photoUrl: updated.photoUrl,
    };
  }

  static async deleteOfficial(id: string) {
    const officialId = BigInt(id);
    await prisma.villageOfficial.delete({
      where: { id: officialId },
    });
    return { success: true };
  }
}
