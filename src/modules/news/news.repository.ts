import { prisma } from "../../shared/db/client";
import { StorageService } from "../storage/storage.service";

export interface FindAllNewsParams {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  search?: string;
  exclude?: string;
  status?: string;
  umkmSlug?: string;
  potentialSlug?: string;
}

export class NewsRepository {
  static async findAllCategories(includeAll = false) {
    const where = includeAll
      ? {}
      : {
          news: {
            some: {
              status: "PUBLISHED",
            },
          },
        };

    const categories = await prisma.newsCategory.findMany({
      where,
      include: {
        _count: {
          select: {
            news: includeAll ? true : { where: { status: "PUBLISHED" } },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: c.description,
      newsCount: c._count.news,
    }));
  }

  static async findAllTypes() {
    return prisma.newsType.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: {
          select: { news: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async findCategoryByName(name: string, tx?: any) {
    const client = tx || prisma;
    return client.newsCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }

  static async createCategory(data: { name: string; slug?: string; description?: string }, tx?: any) {
    const client = tx || prisma;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return client.newsCategory.create({ data: { ...data, slug } });
  }

  static async findTypeByName(name: string, tx?: any) {
    const client = tx || prisma;
    return client.newsType.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }

  static async createType(data: { name: string; slug: string; description?: string }, tx?: any) {
    const client = tx || prisma;
    return client.newsType.create({ data });
  }

  static async findAllPaginated({
    page = 1,
    limit = 6,
    category,
    type,
    search,
    exclude,
    status = "PUBLISHED",
    umkmSlug,
    potentialSlug,
  }: FindAllNewsParams = {}) {
    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (category) {
      if (!isNaN(Number(category))) {
        where.newsCategoryId = BigInt(category);
      } else {
        where.category = {
          slug: category,
        };
      }
    }

    if (type) {
      if (!isNaN(Number(type))) {
        where.newsTypeId = BigInt(type);
      } else {
        where.type = { slug: type };
      }
    }

    if (umkmSlug) {
      where.newsUmkms = {
        some: {
          umkm: {
            slug: umkmSlug,
          },
        },
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ];
    }

    if (exclude) {
      if (!isNaN(Number(exclude))) {
        where.id = { not: BigInt(exclude) };
      } else {
        where.slug = { not: exclude };
      }
    }

    const skip = (page - 1) * limit;

    const [rawNews, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          category: true,
          type: true,
          articleDetail: {
            include: {
              blocks: { orderBy: { sortOrder: "asc" } },
            },
          },
          galleryDetail: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
            },
          },
          newsUmkms: {
            include: {
              umkm: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: [
          { publishedAt: "desc" },
          { id: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    const items = rawNews.map((n) => {
      const cover =
        n.coverUrl ||
        n.articleDetail?.blocks?.find((b) => b.imageUrl)?.imageUrl ||
        n.galleryDetail?.images?.[0]?.imageUrl ||
        "/images/placeholder-news.jpg";

      const catName = n.category?.name || "Kabar UMKM";
      const catSlug = n.category?.slug || "kabar-umkm";

      return {
        id: n.id.toString(),
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        summary: n.excerpt,
        coverUrl: cover,
        coverImage: cover,
        categoryName: catName,
        categorySlug: catSlug,
        typeName: n.type?.name || "Artikel",
        typeSlug: n.type?.slug || "article",
        authorName: "Humas Desa Pringgodani",
        publishedAt: n.publishedAt
          ? n.publishedAt.toISOString()
          : new Date().toISOString(),
        status: n.status,
        rejectionReason: n.rejectionReason || null,
        taggedUmkms: n.newsUmkms.map((nu) => ({
          id: nu.umkm.id.toString(),
          name: nu.umkm.name,
          slug: nu.umkm.slug,
        })),
      };
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  }

  static async findBySlug(slug: string) {
    const n = await prisma.news.findUnique({
      where: { slug },
      include: {
        category: true,
        type: true,
        articleDetail: {
          include: {
            blocks: { orderBy: { sortOrder: "asc" } },
          },
        },
        galleryDetail: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
        newsUmkms: {
          include: {
            umkm: {
              select: {
                id: true,
                name: true,
                slug: true,
                coverUrl: true,
                phone: true,
                address: true,
              },
            },
          },
        },
        newsProducts: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                umkm: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!n) return null;

    const cover =
      n.coverUrl ||
      n.articleDetail?.blocks?.find((b) => b.imageUrl)?.imageUrl ||
      n.galleryDetail?.images?.[0]?.imageUrl ||
      "/images/placeholder-news.jpg";

    const catName = n.category?.name || "Kabar UMKM";
    const catSlug = n.category?.slug || "kabar-umkm";

    const contentSections: any[] = [];
    if (n.articleDetail?.blocks) {
      n.articleDetail.blocks.forEach((block) => {
        contentSections.push({
          sectionTitle: block.subHeading || null,
          paragraph: block.content,
          sectionImage: block.imageUrl || null,
        });
      });
    }

    if (contentSections.length === 0) {
      contentSections.push({
        sectionTitle: null,
        paragraph: n.excerpt,
        sectionImage: null,
      });
    }

    const galleryImages =
      n.galleryDetail?.images?.map((img) => ({
        id: img.id.toString(),
        imageUrl: img.imageUrl,
        caption: img.imageDescription || null,
      })) || [];

    const taggedUmkms = n.newsUmkms.map((nu) => ({
      id: nu.umkm.id.toString(),
      name: nu.umkm.name,
      slug: nu.umkm.slug,
      coverUrl: nu.umkm.coverUrl || "/images/placeholder-umkm.jpg",
      phone: nu.umkm.phone,
      address: nu.umkm.address,
    }));

    const taggedProducts = n.newsProducts.map((np) => ({
      id: np.product.id.toString(),
      name: np.product.name,
      price: np.product.price ? Number(np.product.price) : null,
      imageUrl: np.product.imageUrl || "/images/placeholder-product.jpg",
      umkmName: np.product.umkm?.name,
      umkmSlug: np.product.umkm?.slug,
    }));

    const totalWords = contentSections.reduce(
      (acc, curr) => acc + (curr.paragraph || "").split(/\s+/).length,
      0
    );
    const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

    return {
      id: n.id.toString(),
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      summary: n.excerpt,
      coverUrl: cover,
      coverImage: cover,
      coverCaption: n.title,
      categoryId: n.newsCategoryId.toString(),
      categoryName: catName,
      categorySlug: catSlug,
      typeName: n.type?.name || "Artikel",
      typeSlug: n.type?.slug || "article",
      authorName: "Humas Desa Pringgodani",
      authorRole: "Admin Desa",
      contentSections,
      galleryImages,
      taggedUmkms,
      taggedProducts,
      taggedPotentials: [],
      publishedAt: n.publishedAt
        ? n.publishedAt.toISOString()
        : new Date().toISOString(),
      readingTimeMinutes,
    };
  }

  static async findById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      return null;
    }

    const n = await prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        type: true,
        articleDetail: {
          include: {
            blocks: { orderBy: { sortOrder: "asc" } },
          },
        },
        galleryDetail: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
        newsUmkms: {
          include: {
            umkm: true,
          },
        },
        newsProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!n) return null;

    return {
      id: n.id.toString(),
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      coverUrl: n.coverUrl,
      categoryId: n.newsCategoryId.toString(),
      categoryName: n.category?.name || "Kabar UMKM",
      typeId: n.newsTypeId.toString(),
      typeName: n.type?.name || "Artikel",
      typeSlug: n.type?.slug || "article",
      status: n.status,
      publishedAt: n.publishedAt?.toISOString() || null,
      articleBlocks: n.articleDetail?.blocks?.map((b) => ({
        id: b.id.toString(),
        subHeading: b.subHeading,
        content: b.content,
        imageUrl: b.imageUrl,
        sortOrder: b.sortOrder,
      })) || [],
      galleryImages: n.galleryDetail?.images?.map((img) => ({
        id: img.id.toString(),
        imageUrl: img.imageUrl,
        imageDescription: img.imageDescription,
        sortOrder: img.sortOrder,
      })) || [],
      taggedUmkmIds: n.newsUmkms ? n.newsUmkms.map((nu) => nu.umkmId.toString()) : [],
      taggedProductIds: n.newsProducts ? n.newsProducts.map((np) => np.productId.toString()) : [],
    };
  }

  static async deleteNews(id: bigint) {
    // 1. Fetch media URLs to delete from Supabase Storage
    const existing = await prisma.news.findUnique({
      where: { id },
      include: {
        articleDetail: {
          include: { blocks: { select: { imageUrl: true } } },
        },
        galleryDetail: {
          include: { images: { select: { imageUrl: true } } },
        },
      },
    });

    const imageUrls: (string | null | undefined)[] = [];
    if (existing) {
      if (existing.coverUrl) imageUrls.push(existing.coverUrl);
      if (existing.articleDetail?.blocks) {
        existing.articleDetail.blocks.forEach((b) => {
          if (b.imageUrl) imageUrls.push(b.imageUrl);
        });
      }
      if (existing.galleryDetail?.images) {
        existing.galleryDetail.images.forEach((img) => {
          if (img.imageUrl) imageUrls.push(img.imageUrl);
        });
      }
    }

    // 2. Delete database records
    const deleted = await prisma.$transaction(async (tx) => {
      await tx.newsUmkm.deleteMany({ where: { newsId: id } });
      await tx.newsProduct.deleteMany({ where: { newsId: id } });

      const art = await tx.articleDetail.findUnique({ where: { newsId: id } });
      if (art) {
        await tx.articleBlock.deleteMany({ where: { articleDetailId: art.id } });
        await tx.articleDetail.delete({ where: { id: art.id } });
      }

      const gal = await tx.galleryDetail.findUnique({ where: { newsId: id } });
      if (gal) {
        await tx.galleryImage.deleteMany({ where: { galleryDetailId: gal.id } });
        await tx.galleryDetail.delete({ where: { id: gal.id } });
      }

      return tx.news.delete({ where: { id } });
    });

    // 3. Delete files from Supabase Storage safely
    if (imageUrls.length > 0) {
      await StorageService.deleteFiles(imageUrls);
    }

    return deleted;
  }

  static async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
