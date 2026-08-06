import { prisma } from "../../shared/db/client";

export interface FindAllNewsParams {
  page?: number;
  limit?: number;
  category?: string;
  type?: string;
  search?: string;
  exclude?: string;
  status?: string;
}

export class NewsRepository {
  static async findAllCategories() {
    const categories = await prisma.newsCategory.findMany({
      include: {
        _count: {
          select: { news: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
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

  static async createCategory(data: { name: string; description?: string }, tx?: any) {
    const client = tx || prisma;
    return client.newsCategory.create({ data });
  }

  static async findTypeByName(name: string, tx?: any) {
    const client = tx || prisma;
    return client.newsType.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  }

  static async createType(data: { name: string; slug: string }, tx?: any) {
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
  }: FindAllNewsParams = {}) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      if (!isNaN(Number(category))) {
        where.newsCategoryId = BigInt(category);
      } else {
        where.category = {
          OR: [
            { name: { contains: category, mode: "insensitive" } },
            { name: { equals: category, mode: "insensitive" } },
          ],
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
          articleDetails: {
            include: {
              blocks: { orderBy: { sortOrder: "asc" } },
            },
          },
          galleryDetails: {
            include: {
              images: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    const items = rawNews.map((n) => {
      const cover = n.articleDetails[0]?.coverUrl || n.galleryDetails[0]?.coverUrl || "/images/placeholder-news.jpg";
      const catName = n.category?.name || "Umum";
      const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      return {
        id: n.id.toString(),
        title: n.title,
        slug: n.slug,
        summary: n.excerpt,
        coverImage: cover,
        categoryName: catName,
        categorySlug: catSlug,
        authorName: "Humas Desa Pringgodani",
        publishedAt: n.publishedAt ? n.publishedAt.toISOString() : new Date().toISOString(),
      };
    });

    return { items, total };
  }

  static async findBySlug(slug: string) {
    const n = await prisma.news.findUnique({
      where: { slug },
      include: {
        category: true,
        type: true,
        articleDetails: {
          include: {
            blocks: { orderBy: { sortOrder: "asc" } },
          },
        },
        galleryDetails: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!n) return null;

    const cover = n.articleDetails[0]?.coverUrl || n.galleryDetails[0]?.coverUrl || "/images/placeholder-news.jpg";
    const catName = n.category?.name || "Umum";
    const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const contentSections: any[] = [];
    n.articleDetails.forEach((art) => {
      art.blocks.forEach((block) => {
        contentSections.push({
          sectionTitle: block.subHeading || null,
          paragraph: block.content,
          sectionImage: block.imageUrl || null,
        });
      });
    });

    if (contentSections.length === 0) {
      contentSections.push({
        sectionTitle: null,
        paragraph: n.excerpt,
        sectionImage: null,
      });
    }

    const totalWords = contentSections.reduce((acc, curr) => acc + (curr.paragraph || "").split(/\s+/).length, 0);
    const readingTimeMinutes = Math.max(1, Math.ceil(totalWords / 200));

    return {
      id: n.id.toString(),
      title: n.title,
      slug: n.slug,
      summary: n.excerpt,
      coverImage: cover,
      coverCaption: n.title,
      categoryId: n.newsCategoryId.toString(),
      categoryName: catName,
      categorySlug: catSlug,
      authorName: "Humas Desa Pringgodani",
      authorRole: "Admin Desa",
      contentSections,
      publishedAt: n.publishedAt ? n.publishedAt.toISOString() : new Date().toISOString(),
      readingTimeMinutes,
    };
  }

  static async executeTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}
