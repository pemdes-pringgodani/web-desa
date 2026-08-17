import { ProfileRepository } from "./profile.repository";
import { prisma } from "../../shared/db/client";

export class ProfileService {
  static async getProfileWithStats() {
    const rawProfile = await ProfileRepository.getVillageProfile();
    const [umkmCount, productCount, newsCount] = await Promise.all([
      prisma.umkm.count({ where: { status: "APPROVED" } }),
      prisma.product.count({ where: { umkm: { status: "APPROVED" } } }),
      prisma.news.count({ where: { status: "PUBLISHED" } }),
    ]);

    if (!rawProfile) {
      return {
        profile: {
          villageName: "Desa Pringgodani",
          headGreeting: "Pemerintah Desa Pringgodani berkomitmen penuh mendukung kemajuan UMKM lokal menuju kemandirian ekonomi.",
          headPhoto: "/images/kepala-desa.jpg",
          headName: "Ki Suryo Pringgo",
          headPosition: "Kepala Desa Pringgodani",
          address: "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang, Jawa Timur",
          phone: "081234567890",
          email: "info@pringgodani.desa.id",
          officials: [],
        },
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

    const profile = {
      villageName: rawProfile.villageName || "Desa Pringgodani",
      headGreeting: rawProfile.headGreeting || "Selamat datang di portal LokalUMKM Desa Pringgodani.",
      headPhoto: rawProfile.headPhoto || "/images/kepala-desa.jpg",
      headName: headOfficial?.name || "Kepala Desa Pringgodani",
      headPosition: headOfficial?.position || "Kepala Desa",
      aboutText:
        rawProfile.aboutText ||
        "Desa Pringgodani berada di wilayah Kecamatan Bantur, Kabupaten Malang, Jawa Timur. Wilayah ini dianugerahi tanah yang subur untuk komoditas pertanian tebu, padi, dan palawija, serta masyarakat yang aktif memproduksi aneka produk olahan rumahan, kerajinan tangan, dan aneka usaha jasa.\n\nMelalui portal Lokal Pringgodani, Pemerintah Desa memfasilitasi publikasi produk olahan, sentra kerajinan, dan hasil bumi warga agar mudah ditemukan oleh masyarakat luas dan pembeli dari luar daerah secara langsung.",
      address: rawProfile.address,
      phone: rawProfile.phone,
      email: rawProfile.email,
      officials: rawProfile.officials.map((o) => ({
        id: o.id.toString(),
        name: o.name,
        position: o.position,
        photo: o.photoUrl,
        photoUrl: o.photoUrl,
        greeting: o.greeting || undefined,
        email: o.email || undefined,
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
