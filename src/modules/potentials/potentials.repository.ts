import { prisma } from "../../shared/db/client";

export class PotentialsRepository {
  static async findAll() {
    const raw = await prisma.villagePotential.findMany({
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const items = raw.map((p) => ({
      id: p.id.toString(),
      title: p.name,
      slug: p.slug,
      category: p.category?.name || "Pertanian",
      overview: p.summary,
      coverImage: p.coverUrl || "/images/placeholder-potensi.jpg",
    }));

    return { items, total: items.length };
  }

  static async findBySlug(slug: string) {
    const p = await prisma.villagePotential.findUnique({
      where: { slug },
      include: {
        category: true,
        articles: true,
        umkms: {
          include: {
            category: true,
            products: true,
          },
        },
        news: {
          include: {
            category: true,
            articleDetails: true,
          },
        },
      },
    });

    if (!p) return null;

    const description = p.articles.map((a) => a.content).join("\n\n") || p.summary;
    const gallery = p.articles.map((a) => a.imageUrl).filter(Boolean) as string[];

    const relatedUmkm = p.umkms.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      category: u.category?.name || "UMKM",
      description: u.description,
      logo: u.coverUrl || "/images/placeholder-umkm.jpg",
      whatsappNumber: u.phone,
      address: u.address,
      ownerName: u.ownerName,
      publishedAt: new Date().toISOString(),
    }));

    const featuredProducts: any[] = [];
    p.umkms.forEach((u) => {
      u.products.forEach((prod) => {
        featuredProducts.push({
          id: prod.id.toString(),
          productName: prod.name,
          price: prod.price ? Number(prod.price) : null,
          productPhoto: prod.imageUrl,
          umkmName: u.name,
          umkmSlug: u.slug,
        });
      });
    });

    const relatedNews = p.news.map((n) => ({
      id: n.id.toString(),
      title: n.title,
      slug: n.slug,
      coverImage: n.articleDetails[0]?.coverUrl || "/images/placeholder-news.jpg",
      categoryName: n.category?.name || "Berita",
      publishedAt: n.publishedAt ? n.publishedAt.toISOString() : new Date().toISOString(),
    }));

    return {
      id: p.id.toString(),
      title: p.name,
      slug: p.slug,
      category: p.category?.name || "Pertanian",
      overview: p.summary,
      description,
      coverImage: p.coverUrl || "/images/placeholder-potensi.jpg",
      gallery,
      latitude: -7.98,
      longitude: 112.63,
      relatedUmkm,
      featuredProducts,
      relatedNews,
    };
  }
}
