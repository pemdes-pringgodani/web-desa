import { prisma } from "../../shared/db/client";

export interface FindAllUmkmParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  exclude?: string;
  status?: string;
}

export class UmkmRepository {
  static async findAllCategories() {
    const categories = await prisma.umkmCategory.findMany({
      include: {
        _count: {
          select: { umkms: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((c) => ({
      value: c.name.toUpperCase().replace(/[^A_Z0-9]/g, "_"),
      slug: c.slug,
      label: c.name,
      umkmCount: c._count.umkms,
    }));
  }

  static async findAllPaginated({
    page = 1,
    limit = 8,
    category,
    search,
    exclude,
    status,
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

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (exclude) {
      if (!isNaN(Number(exclude))) {
        where.id = { not: BigInt(exclude) };
      } else {
        where.slug = { not: exclude };
      }
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      prisma.umkm.findMany({
        where,
        include: {
          category: true,
          potential: true,
        },
        orderBy: {
          id: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.umkm.count({ where }),
    ]);

    const items = rawItems.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      category: u.category?.name || "UMKM",
      categoryName: u.category?.name || "UMKM",
      description: u.description,
      logo: u.coverUrl || "/images/placeholder-umkm.jpg",
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      phone: u.phone,
      whatsappNumber: u.phone,
      address: u.address,
      ownerName: u.ownerName,
      status: u.status,
      publishedAt: new Date().toISOString(),
    }));

    return { items, total };
  }

  static async findBySlug(slug: string) {
    const u = await prisma.umkm.findUnique({
      where: { slug },
      include: {
        category: true,
        potential: true,
        galleries: true,
        products: true,
      },
    });

    if (!u) return null;

    return {
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
      latitude: u.latitude ? Number(u.latitude) : -7.98,
      longitude: u.longitude ? Number(u.longitude) : 112.63,
      gallery: u.galleries.map((g) => g.imageUrl),
      products: u.products.map((p) => ({
        id: p.id.toString(),
        productName: p.name,
        price: p.price ? Number(p.price) : null,
        productPhoto: p.imageUrl,
      })),
      potential: u.potential
        ? {
            id: u.potential.id.toString(),
            title: u.potential.name,
            slug: u.potential.slug,
            category: "Potensi",
          }
        : null,
    };
  }

  static async deleteUmkm(id: bigint) {
    return prisma.$transaction(async (tx) => {
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
