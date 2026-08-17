import { prisma } from "../../shared/db/client";
import { formatWhatsAppNumber, createWhatsAppLink } from "../../shared/utils/whatsapp";

export interface FindAllUmkmParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  exclude?: string;
  status?: string;
  potentialSlug?: string;
}

export class UmkmRepository {
  static async findAllCategories(includeAll = false) {
    const where = includeAll
      ? {}
      : {
          umkms: {
            some: {
              status: "APPROVED",
            },
          },
        };

    const categories = await prisma.umkmCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            umkms: includeAll ? true : { where: { status: "APPROVED" } },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((c) => ({
      id: c.id.toString(),
      value: c.name.toUpperCase().replace(/[^A-Z0-9]/g, "_"),
      slug: c.slug,
      label: c.name,
      name: c.name,
      description: c.description,
      umkmCount: c._count.umkms,
    }));
  }

  static async findAllPaginated({
    page = 1,
    limit = 8,
    category,
    search,
    exclude,
    status = "APPROVED",
    potentialSlug,
  }: FindAllUmkmParams = {}) {
    const where: any = {};

    if (category) {
      if (!isNaN(Number(category))) {
        where.umkmCategoryId = BigInt(category);
      } else {
        where.category = {
          slug: category,
        };
      }
    }

    if (potentialSlug) {
      where.potential = {
        slug: potentialSlug,
      };
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { ownerName: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
      ];
    }

    if (exclude) {
      if (!isNaN(Number(exclude))) {
        where.id = { not: BigInt(exclude) };
      } else {
        where.slug = { not: exclude };
      }
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      prisma.umkm.findMany({
        where,
        include: {
          category: true,
          potential: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.umkm.count({ where }),
    ]);

    const items = rawItems.map((u) => {
      const waFormatted = formatWhatsAppNumber(u.phone);
      const waTemplate = `Halo ${u.name}, saya melihat profil usaha Anda di LokalUMKM Pringgodani dan ingin bertanya seputar produk/layanan Anda.`;
      const waLink = createWhatsAppLink(u.phone, waTemplate);

      return {
        id: u.id.toString(),
        name: u.name,
        slug: u.slug,
        category: u.category?.name || "UMKM",
        categorySlug: u.category?.slug || "umkm",
        categoryName: u.category?.name || "UMKM",
        description: u.description,
        coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
        logo: u.coverUrl || "/images/placeholder-umkm.jpg",
        phone: u.phone,
        whatsappNumber: u.phone,
        whatsappFormatted: waFormatted,
        whatsappLink: waLink,
        email: u.email || null,
        address: u.address,
        mapsUrl: u.mapsUrl || null,
        latitude: u.latitude ? Number(u.latitude) : null,
        longitude: u.longitude ? Number(u.longitude) : null,
        ownerName: u.ownerName,
        since: u.since,
        openDay: u.openDay || null,
        startTime: u.startTime ? u.startTime.toISOString().substring(11, 16) : null,
        endTime: u.endTime ? u.endTime.toISOString().substring(11, 16) : null,
        status: u.status,
        totalProducts: u._count.products,
        publishedAt: u.publishedAt?.toISOString() || null,
        potential: u.potential
          ? {
              id: u.potential.id.toString(),
              name: u.potential.name,
              slug: u.potential.slug,
            }
          : null,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async findBySlug(slug: string) {
    const u = await prisma.umkm.findUnique({
      where: { slug },
      include: {
        category: true,
        potential: true,
        galleries: true,
        products: true,
        newsUmkms: {
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

    if (!u) return null;

    const waFormatted = formatWhatsAppNumber(u.phone);
    const waTemplate = `Halo ${u.name}, saya melihat profil usaha Anda di LokalUMKM Pringgodani dan ingin bertanya seputar produk/layanan Anda.`;
    const waLink = createWhatsAppLink(u.phone, waTemplate);

    const relatedNews = u.newsUmkms
      .filter((nu) => nu.news.status === "PUBLISHED")
      .map((nu) => ({
        id: nu.news.id.toString(),
        title: nu.news.title,
        slug: nu.news.slug,
        excerpt: nu.news.excerpt,
        coverUrl: nu.news.coverUrl,
        category: nu.news.category.name,
        publishedAt: nu.news.publishedAt?.toISOString() || null,
      }));

    return {
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      category: u.category?.name || "UMKM",
      categorySlug: u.category?.slug || "umkm",
      description: u.description,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      logo: u.coverUrl || "/images/placeholder-umkm.jpg",
      phone: u.phone,
      whatsappNumber: u.phone,
      whatsappFormatted: waFormatted,
      whatsappLink: waLink,
      email: u.email || null,
      address: u.address,
      mapsUrl: u.mapsUrl || null,
      ownerName: u.ownerName,
      since: u.since,
      openDay: u.openDay || null,
      startTime: u.startTime ? u.startTime.toISOString().substring(11, 16) : null,
      endTime: u.endTime ? u.endTime.toISOString().substring(11, 16) : null,
      status: u.status,
      publishedAt: u.publishedAt?.toISOString() || null,
      latitude: u.latitude ? Number(u.latitude) : -8.31,
      longitude: u.longitude ? Number(u.longitude) : 112.58,
      gallery: u.galleries.map((g) => g.imageUrl),
      galleries: u.galleries.map((g) => ({
        id: g.id.toString(),
        imageUrl: g.imageUrl,
        caption: g.caption || null,
      })),
      products: u.products.map((p) => {
        const prodWa = `Halo ${u.name}, saya melihat produk "${p.name}" di LokalUMKM Pringgodani dan ingin memesannya.`;
        return {
          id: p.id.toString(),
          name: p.name,
          productName: p.name,
          description: p.description,
          price: p.price ? Number(p.price) : null,
          imageUrl: p.imageUrl || "/images/placeholder-product.jpg",
          productPhoto: p.imageUrl || "/images/placeholder-product.jpg",
          whatsappLink: createWhatsAppLink(u.phone, prodWa),
        };
      }),
      potential: u.potential
        ? {
            id: u.potential.id.toString(),
            title: u.potential.name,
            name: u.potential.name,
            slug: u.potential.slug,
            category: "Potensi",
          }
        : null,
      relatedNews,
    };
  }

  static async deleteUmkm(id: bigint) {
    return prisma.$transaction(async (tx) => {
      await tx.newsUmkm.deleteMany({ where: { umkmId: id } });
      await tx.product.deleteMany({ where: { umkmId: id } });
      await tx.umkmGallery.deleteMany({ where: { umkmId: id } });
      return tx.umkm.delete({ where: { id } });
    });
  }

  static async findCategoryByName(name: string, tx?: any) {
    const client = tx || prisma;
    return client.umkmCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }

  static async createCategory(data: { name: string; slug: string }, tx?: any) {
    const client = tx || prisma;
    return client.umkmCategory.create({ data });
  }

  static async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
