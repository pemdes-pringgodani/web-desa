import { prisma } from "../../shared/db/client";

export interface BannerDto {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
}

export class BannerService {
  static async getActiveBanners() {
    // 1. Fetch latest published news with article detail cover
    const newsItems = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      include: {
        articleDetails: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });

    const items: BannerDto[] = [];

    newsItems.forEach((n, idx) => {
      const cover = n.articleDetails[0]?.coverUrl;
      if (cover) {
        items.push({
          id: `banner-news-${n.id}`,
          title: n.title,
          imageUrl: cover,
          linkUrl: `/berita/${n.slug}`,
          order: idx,
        });
      }
    });

    // 2. Fallback banners if database news cover URLs are scarce
    if (items.length === 0) {
      items.push(
        {
          id: "banner-1",
          title: "Selamat Datang di Desa Pringgodani",
          imageUrl:
            "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
          linkUrl: null,
          order: 0,
        },
        {
          id: "banner-2",
          title: "Ayo Daftarkan UMKM Anda",
          imageUrl:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
          linkUrl: "/umkm/daftar",
          order: 1,
        }
      );
    }

    return { items };
  }
}
