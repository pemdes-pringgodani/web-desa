import { ProfileRepository } from "./profile.repository";
import { prisma } from "../../shared/db/client";

export class ProfileService {
  static async getProfileWithStats() {
    const rawProfile = await ProfileRepository.getVillageProfile();
    const [umkmCount, productCount, newsCount] = await Promise.all([
      prisma.umkm.count(),
      prisma.product.count(),
      prisma.news.count(),
    ]);

    if (!rawProfile) {
      return {
        profile: null,
        stats: {
          umkmCount,
          productCount,
          newsCount,
          dusunCount: 4,
        },
      };
    }

    const headOfficial = rawProfile.officials.find((o) =>
      o.position.toLowerCase().includes("kepala desa")
    ) || rawProfile.officials[0];

    const historyContent = rawProfile.histories
      .map((h) => h.details.map((d) => d.content).join("\n\n"))
      .join("\n\n");

    const historyExcerpt = historyContent.length > 200
      ? historyContent.substring(0, 200) + "..."
      : historyContent;

    const profile = {
      villageName: "Desa Pringgodani",
      headGreeting: headOfficial?.greeting || "Selamat datang di website resmi Desa Pringgodani.",
      headPhoto: headOfficial?.photoUrl || "/images/kepala-desa.jpg",
      headName: headOfficial?.name || "Kepala Desa",
      headPosition: headOfficial?.position || "Kepala Desa",
      historyText: historyContent,
      historyExcerpt: historyExcerpt,
      vision: rawProfile.vision?.vision || "",
      missions: rawProfile.vision?.missions.map((m) => m.mission) || [],
      officials: rawProfile.officials.map((o) => ({
        name: o.name,
        position: o.position,
        photo: o.photoUrl,
      })),
    };

    return {
      profile,
      stats: {
        umkmCount,
        productCount,
        newsCount,
        dusunCount: 4,
      },
    };
  }
}
