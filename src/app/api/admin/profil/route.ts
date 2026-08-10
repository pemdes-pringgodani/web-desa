import { prisma } from "../../../../shared/db/client";
import { ApiResponse } from "../../../../shared/utils/response";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    let profile = await prisma.villageProfile.findFirst({
      include: {
        officials: true,
        vision: {
          include: {
            missions: true,
          },
        },
        histories: {
          include: {
            details: true,
          },
        },
      },
    });

    if (!profile) {
      return ApiResponse.success({
        headName: "Ki Suryo Pringgo",
        headPosition: "Kepala Desa Pringgodani",
        headPhoto: "/images/kepala-desa.jpg",
        headGreeting: "Selamat datang di website resmi Desa Pringgodani.",
        historyText: "Desa Pringgodani berdiri sejak masa kolonial...",
        vision: "Mewujudkan Desa Pringgodani yang mandiri, maju, dan sejahtera.",
        missions: ["Meningkatkan kualitas pelayanan publik"],
        structureImageUrl: "/images/bagan-struktur.png",
        officials: [],
      });
    }

    const headOfficial = profile.officials.find((o) =>
      o.position.toLowerCase().includes("kepala desa")
    ) || profile.officials[0];

    const historyText = profile.histories
      .map((h) => h.details.map((d) => d.content).join("\n\n"))
      .join("\n\n");

    return ApiResponse.success({
      headName: headOfficial?.name || "Ki Suryo Pringgo",
      headPosition: headOfficial?.position || "Kepala Desa Pringgodani",
      headPhoto: headOfficial?.photoUrl || "/images/kepala-desa.jpg",
      headGreeting: headOfficial?.greeting || "Selamat datang di website resmi Desa Pringgodani.",
      historyText,
      vision: profile.vision?.vision || "",
      missions: profile.vision?.missions.map((m) => m.mission) || [],
      structureImageUrl: profile.structureImageUrl || "",
      officials: profile.officials.map((o) => ({
        id: o.id.toString(),
        name: o.name,
        position: o.position,
        photoUrl: o.photoUrl,
        email: o.email || "",
        greeting: o.greeting || "",
      })),
    });
  } catch (error: any) {
    console.error("Get admin profil error:", error);
    return ApiResponse.error("Gagal mengambil profil admin", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const {
      headName,
      headPosition,
      headPhoto,
      headGreeting,
      historyText,
      vision,
      missions,
      structureImageUrl,
    } = body;

    let profile = await prisma.villageProfile.findFirst();

    if (!profile) {
      let visionRow = await prisma.villageVision.findFirst();
      if (!visionRow) {
        visionRow = await prisma.villageVision.create({
          data: { vision: vision || "Visi Desa Pringgodani" },
        });
      }

      profile = await prisma.villageProfile.create({
        data: {
          villageVisionId: visionRow.id,
          structureImageUrl: structureImageUrl || "",
          address: "Jl. Raya Pringgodani No. 1",
          phone: "081234567890",
        },
      });
    } else if (structureImageUrl) {
      await prisma.villageProfile.update({
        where: { id: profile.id },
        data: { structureImageUrl },
      });
    }

    // Update Visi
    if (vision) {
      await prisma.villageVision.update({
        where: { id: profile.villageVisionId },
        data: { vision },
      });
    }

    // Update Misi
    if (Array.isArray(missions)) {
      await prisma.villageMission.deleteMany({
        where: { villageVisionId: profile.villageVisionId },
      });

      for (let i = 0; i < missions.length; i++) {
        const m = missions[i];
        if (m && m.trim()) {
          await prisma.villageMission.create({
            data: {
              villageVisionId: profile.villageVisionId,
              mission: m.trim(),
              sortOrder: i + 1,
            },
          });
        }
      }
    }

    // Update atau buat Kepala Desa di VillageOfficial
    if (headName || headPosition || headPhoto || headGreeting) {
      const existingHead = await prisma.villageOfficial.findFirst({
        where: {
          villageProfileId: profile.id,
          position: { contains: "Kepala Desa", mode: "insensitive" },
        },
      });

      if (existingHead) {
        await prisma.villageOfficial.update({
          where: { id: existingHead.id },
          data: {
            name: headName || existingHead.name,
            position: headPosition || existingHead.position,
            photoUrl: headPhoto || existingHead.photoUrl,
            greeting: headGreeting !== undefined ? headGreeting : existingHead.greeting,
          },
        });
      } else {
        await prisma.villageOfficial.create({
          data: {
            villageProfileId: profile.id,
            name: headName || "Kepala Desa",
            position: headPosition || "Kepala Desa Pringgodani",
            photoUrl: headPhoto || "/images/kepala-desa.jpg",
            greeting: headGreeting || "Selamat datang di website resmi Desa Pringgodani.",
          },
        });
      }
    }

    return ApiResponse.success({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error: any) {
    console.error("Update admin profil error:", error);
    return ApiResponse.error("Gagal memperbarui profil desa", 500);
  }
}
