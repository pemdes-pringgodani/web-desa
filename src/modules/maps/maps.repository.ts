import { prisma } from "../../shared/db/client";

export class MapsRepository {
  static async findCategories() {
    return prisma.mapCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        _count: {
          select: { locations: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async findLocations(categorySlug?: string, searchQuery?: string) {
    const where: any = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { shortDescription: { contains: searchQuery, mode: "insensitive" } },
        { address: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    return prisma.mapLocation.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async findLocationById(id: bigint) {
    return prisma.mapLocation.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  static async resolveLocation(query: string) {
    return prisma.mapLocation.findFirst({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
      },
    });
  }
}
