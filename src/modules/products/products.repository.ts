import { prisma } from "../../shared/db/client";
import { FindAllProductsParams } from "./products.schema";

export class ProductsRepository {
  static async findAllPaginated({
    page = 1,
    limit = 12,
    category,
    search,
    umkmSlug,
    minPrice,
    maxPrice,
    sort = "newest",
  }: Partial<FindAllProductsParams> = {}) {
    const where: any = {
      umkm: {
        status: "APPROVED",
      },
    };

    if (category) {
      where.umkm.category = {
        slug: category,
      };
    }

    if (umkmSlug) {
      where.umkm.slug = umkmSlug;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { umkm: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { id: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };
    else if (sort === "name_asc") orderBy = { name: "asc" };

    const skip = (page - 1) * limit;

    const [rawItems, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          umkm: {
            include: {
              category: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const items = rawItems.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: p.price ? Number(p.price) : null,
      imageUrl: p.imageUrl || "/images/placeholder-product.jpg",
      umkm: {
        id: p.umkm.id.toString(),
        name: p.umkm.name,
        slug: p.umkm.slug,
        ownerName: p.umkm.ownerName,
        phone: p.umkm.phone,
        address: p.umkm.address,
        coverUrl: p.umkm.coverUrl || "/images/placeholder-umkm.jpg",
        category: p.umkm.category?.name || "UMKM",
        categorySlug: p.umkm.category?.slug || "umkm",
      },
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async findById(id: bigint) {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        umkm: {
          include: {
            category: true,
            galleries: true,
          },
        },
        newsProducts: {
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

    const relatedProductsRaw = await prisma.product.findMany({
      where: {
        umkmId: p.umkmId,
        id: { not: p.id },
      },
      take: 4,
    });

    const relatedProducts = relatedProductsRaw.map((rp) => ({
      id: rp.id.toString(),
      name: rp.name,
      price: rp.price ? Number(rp.price) : null,
      imageUrl: rp.imageUrl || "/images/placeholder-product.jpg",
    }));

    const relatedNews = p.newsProducts
      .filter((np) => np.news.status === "PUBLISHED")
      .map((np) => ({
        id: np.news.id.toString(),
        title: np.news.title,
        slug: np.news.slug,
        excerpt: np.news.excerpt,
        coverUrl: np.news.coverUrl,
        category: np.news.category.name,
        publishedAt: np.news.publishedAt?.toISOString() || null,
      }));

    return {
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: p.price ? Number(p.price) : null,
      imageUrl: p.imageUrl || "/images/placeholder-product.jpg",
      umkm: {
        id: p.umkm.id.toString(),
        name: p.umkm.name,
        slug: p.umkm.slug,
        ownerName: p.umkm.ownerName,
        phone: p.umkm.phone,
        email: p.umkm.email,
        address: p.umkm.address,
        mapsUrl: p.umkm.mapsUrl,
        coverUrl: p.umkm.coverUrl || "/images/placeholder-umkm.jpg",
        category: p.umkm.category?.name || "UMKM",
        categorySlug: p.umkm.category?.slug || "umkm",
      },
      relatedProducts,
      relatedNews,
    };
  }

  static async createProduct(data: {
    umkmId: bigint;
    name: string;
    description: string;
    price?: number | null;
    imageUrl?: string | null;
  }) {
    return prisma.product.create({
      data: {
        umkmId: data.umkmId,
        name: data.name,
        description: data.description,
        price: data.price !== undefined && data.price !== null ? data.price : null,
        imageUrl: data.imageUrl || null,
      },
    });
  }

  static async updateProduct(
    id: bigint,
    data: {
      name?: string;
      description?: string;
      price?: number | null;
      imageUrl?: string | null;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });
  }

  static async deleteProduct(id: bigint) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
