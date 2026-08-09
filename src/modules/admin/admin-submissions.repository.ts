import { prisma } from "../../shared/db/client";

export class AdminSubmissionsRepository {
  static async getPendingSubmissions() {
    const [pendingNews, pendingUmkm] = await Promise.all([
      prisma.news.findMany({
        where: { status: "PENDING" },
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
        orderBy: { publishedAt: "desc" },
      }),
      prisma.umkm.findMany({
        where: { status: "PENDING" },
        include: {
          category: true,
          products: true,
        },
        orderBy: { id: "desc" },
      }),
    ]);

    const newsSubmissions = pendingNews.map((n) => {
      const cover =
        n.articleDetails[0]?.coverUrl ||
        n.galleryDetails[0]?.coverUrl ||
        "/images/placeholder-news.jpg";

      const contentBlocks =
        n.articleDetails[0]?.blocks?.map((b) => ({
          subHeading: b.subHeading || undefined,
          content: b.content,
          imageUrl: b.imageUrl || undefined,
        })) || [];

      return {
        id: n.id.toString(),
        type: "NEWS" as const,
        title: n.title,
        slug: n.slug,
        excerpt: n.excerpt,
        summary: n.excerpt,
        categoryName: n.category?.name || "Umum",
        coverUrl: cover,
        coverImage: cover,
        contentBlocks,
        submittedAt: n.publishedAt
          ? n.publishedAt.toISOString()
          : new Date().toISOString(),
        status: n.status,
      };
    });

    const umkmSubmissions = pendingUmkm.map((u) => ({
      id: u.id.toString(),
      type: "UMKM" as const,
      name: u.name,
      slug: u.slug,
      ownerName: u.ownerName,
      categoryName: u.category?.name || "UMKM",
      description: u.description,
      phone: u.phone,
      address: u.address,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      products: u.products?.map((p) => ({
        name: p.name,
        price: p.price ? Number(p.price) : 0,
        description: p.description,
        imageUrl: p.imageUrl || undefined,
      })),
      submittedAt: new Date().toISOString(),
      status: u.status,
    }));

    return {
      news: newsSubmissions,
      umkm: umkmSubmissions,
      totalPending: newsSubmissions.length + umkmSubmissions.length,
    };
  }

  static async updateNewsStatus(
    id: string,
    status: "PUBLISHED" | "REJECTED" | "DRAFT",
    rejectionReason?: string
  ) {
    const newsId = BigInt(id);
    const reason = status === "REJECTED" ? rejectionReason || null : null;

    try {
      return await prisma.news.update({
        where: { id: newsId },
        data: {
          status,
          rejectionReason: reason,
        } as any,
      });
    } catch (e: any) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "News" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT`
        );
        await prisma.$executeRaw`UPDATE "News" SET "status" = ${status}, "rejection_reason" = ${reason} WHERE "id" = ${newsId}`;
      } catch {
        await prisma.news.update({
          where: { id: newsId },
          data: { status },
        });
      }
      return prisma.news.findUnique({ where: { id: newsId } });
    }
  }

  static async updateUmkmStatus(
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING",
    rejectionReason?: string
  ) {
    const umkmId = BigInt(id);
    const reason = status === "REJECTED" ? rejectionReason || null : null;

    try {
      return await prisma.umkm.update({
        where: { id: umkmId },
        data: {
          status,
          rejectionReason: reason,
        } as any,
      });
    } catch (e: any) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "Umkm" ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT`
        );
        await prisma.$executeRaw`UPDATE "Umkm" SET "status" = ${status}, "rejection_reason" = ${reason} WHERE "id" = ${umkmId}`;
      } catch {
        await prisma.umkm.update({
          where: { id: umkmId },
          data: { status },
        });
      }
      return prisma.umkm.findUnique({ where: { id: umkmId } });
    }
  }
}
