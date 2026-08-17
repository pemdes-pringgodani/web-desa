import { prisma } from "../../shared/db/client";

export class PotentialsRepository {
  static async findAll() {
    const raw = await prisma.villagePotential.findMany({
      include: {
        category: true,
        _count: {
          select: {
            umkms: { where: { status: "APPROVED" } },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const items = raw.map((p) => ({
      id: p.id.toString(),
      title: p.name,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || "Pertanian",
      overview: p.summary,
      summary: p.summary,
      description: p.description || p.summary,
      coverUrl: p.coverUrl || "/images/placeholder-potensi.jpg",
      coverImage: p.coverUrl || "/images/placeholder-potensi.jpg",
      umkmCount: p._count.umkms,
    }));

    return { items, total: items.length };
  }

  static async findBySlug(slug: string) {
    const p = await prisma.villagePotential.findUnique({
      where: { slug },
      include: {
        category: true,
        umkms: {
          where: { status: "APPROVED" },
          include: {
            category: true,
            products: true,
          },
        },
        newsPotentials: {
          include: {
            news: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!p) return null;

    const relatedUmkm = p.umkms.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      category: u.category?.name || "UMKM",
      description: u.description,
      logo: u.coverUrl || "/images/placeholder-umkm.jpg",
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      whatsappNumber: u.phone,
      phone: u.phone,
      address: u.address,
      ownerName: u.ownerName,
      totalProducts: u.products.length,
      publishedAt: u.publishedAt?.toISOString() || new Date().toISOString(),
    }));

    const featuredProducts: any[] = [];
    p.umkms.forEach((u) => {
      u.products.forEach((prod) => {
        featuredProducts.push({
          id: prod.id.toString(),
          name: prod.name,
          productName: prod.name,
          description: prod.description,
          price: prod.price ? Number(prod.price) : null,
          imageUrl: prod.imageUrl || "/images/placeholder-product.jpg",
          productPhoto: prod.imageUrl || "/images/placeholder-product.jpg",
          umkmName: u.name,
          umkmSlug: u.slug,
        });
      });
    });

    const relatedNews = p.newsPotentials
      .filter((np) => np.news.status === "PUBLISHED")
      .map((np) => ({
        id: np.news.id.toString(),
        title: np.news.title,
        slug: np.news.slug,
        excerpt: np.news.excerpt,
        coverImage: np.news.coverUrl || "/images/placeholder-news.jpg",
        coverUrl: np.news.coverUrl || "/images/placeholder-news.jpg",
        categoryName: np.news.category?.name || "Berita",
        publishedAt: np.news.publishedAt ? np.news.publishedAt.toISOString() : new Date().toISOString(),
      }));

    return {
      id: p.id.toString(),
      title: p.name,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || "Pertanian",
      overview: p.summary,
      summary: p.summary,
      description: p.description || p.summary,
      coverUrl: p.coverUrl || "/images/placeholder-potensi.jpg",
      coverImage: p.coverUrl || "/images/placeholder-potensi.jpg",
      umkmCount: relatedUmkm.length,
      productCount: featuredProducts.length,
      relatedUmkm,
      featuredProducts,
      relatedNews,
    };
  }
}
