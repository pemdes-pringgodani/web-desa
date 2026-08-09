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
    // Fetch latest published news with article or gallery cover from PostgreSQL database
    const newsItems = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      include: {
        articleDetails: true,
        galleryDetails: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 5,
    });

    const items: BannerDto[] = [];

    newsItems.forEach((n, idx) => {
      const cover = n.articleDetails[0]?.coverUrl || n.galleryDetails[0]?.coverUrl;
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

    return { items };
  }
}
