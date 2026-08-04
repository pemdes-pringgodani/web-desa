import { prisma } from "../../shared/db/client";

export class UmkmRepository {
  static async findAllCategories() {
    return prisma.umkmCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async findBySlug(slug: string) {
    return prisma.umkm.findUnique({
      where: { slug },
      include: {
        category: true,
        potential: true,
        galleries: true,
        products: true,
      },
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
