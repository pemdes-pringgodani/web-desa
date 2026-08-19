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
      if (!isNaN(Number(category))) {
        where.umkm = {
          ...where.umkm,
          umkmCategoryId: BigInt(category),
        };
      } else {
        where.umkm = {
          ...where.umkm,
          category: {
            slug: category,
          },
        };
      }
    }

    if (umkmSlug) {
      where.umkm = {
        ...where.umkm,
        slug: umkmSlug,
      };
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
      umkm: p.umkm
        ? {
            id: p.umkm.id.toString(),
            name: p.umkm.name,
            slug: p.umkm.slug,
            ownerName: p.umkm.ownerName,
            phone: p.umkm.phone,
            address: p.umkm.address,
            coverUrl: p.umkm.coverUrl || "/images/placeholder-umkm.jpg",
            category: p.umkm.category?.name || "UMKM",
            categorySlug: p.umkm.category?.slug || "umkm",
          }
        : {
            id: "0",
            name: "UMKM Desa Pringgodani",
            slug: "umkm",
            ownerName: "",
            phone: "",
            address: "",
            coverUrl: "/images/placeholder-umkm.jpg",
            category: "UMKM",
            categorySlug: "umkm",
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
          },
        },
      },
    });

    if (!p) return null;

    const otherRaw = await prisma.product.findMany({
      where: {
        umkmId: p.umkmId,
        NOT: { id },
        umkm: {
          status: "APPROVED",
        },
      },
      take: 6,
      orderBy: { id: "desc" },
      include: {
        umkm: {
          include: {
            category: true,
          },
        },
      },
    });

    const otherProducts = otherRaw.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price ? Number(item.price) : null,
      imageUrl: item.imageUrl || "/images/placeholder-product.jpg",
      umkmId: item.umkmId.toString(),
      umkm: item.umkm
        ? {
            id: item.umkm.id.toString(),
            name: item.umkm.name,
            slug: item.umkm.slug,
            ownerName: item.umkm.ownerName,
            phone: item.umkm.phone,
            address: item.umkm.address,
            coverUrl: item.umkm.coverUrl || "/images/placeholder-umkm.jpg",
            category: item.umkm.category
              ? {
                  id: item.umkm.category.id.toString(),
                  name: item.umkm.category.name,
                  slug: item.umkm.category.slug,
                }
              : undefined,
          }
        : undefined,
    }));

    return {
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: p.price ? Number(p.price) : null,
      imageUrl: p.imageUrl || "/images/placeholder-product.jpg",
      umkm: p.umkm
        ? {
            id: p.umkm.id.toString(),
            name: p.umkm.name,
            slug: p.umkm.slug,
            ownerName: p.umkm.ownerName,
            phone: p.umkm.phone,
            address: p.umkm.address,
            coverUrl: p.umkm.coverUrl || "/images/placeholder-umkm.jpg",
            category: p.umkm.category?.name || "UMKM",
            categorySlug: p.umkm.category?.slug || "umkm",
          }
        : {
            id: "0",
            name: "UMKM Desa Pringgodani",
            slug: "umkm",
            ownerName: "",
            phone: "",
            address: "",
            coverUrl: "/images/placeholder-umkm.jpg",
            category: "UMKM",
            categorySlug: "umkm",
          },
      otherProducts,
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
        price: data.price !== null && data.price !== undefined ? data.price : null,
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
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && {
          price: data.price !== null ? data.price : null,
        }),
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
