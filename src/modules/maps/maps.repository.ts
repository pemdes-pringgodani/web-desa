import { prisma } from "../../shared/db/client";

export interface CreateMapLocationDTO {
  mapCategoryId: string;
  name: string;
  shortDescription?: string;
  imageUrl?: string;
  address?: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
}

export interface CreateMapCategoryDTO {
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

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

    const locations = await prisma.mapLocation.findMany({
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

    return locations.map((loc) => ({
      id: loc.id.toString(),
      name: loc.name,
      mapCategoryId: loc.mapCategoryId.toString(),
      categoryId: loc.mapCategoryId.toString(),
      categoryName: loc.category?.name || "Fasilitas Publik",
      shortDescription: loc.shortDescription || "",
      address: loc.address || "",
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      googleMapsUrl: loc.googleMapsUrl || undefined,
      imageUrl: loc.imageUrl || undefined,
      category: loc.category
        ? {
            id: loc.category.id.toString(),
            name: loc.category.name,
            slug: loc.category.slug,
            icon: loc.category.icon,
            color: loc.category.color,
          }
        : undefined,
    }));
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

  static async createLocation(data: CreateMapLocationDTO) {
    return prisma.mapLocation.create({
      data: {
        mapCategoryId: BigInt(data.mapCategoryId),
        name: data.name,
        shortDescription: data.shortDescription || null,
        imageUrl: data.imageUrl || null,
        address: data.address || null,
        latitude: data.latitude,
        longitude: data.longitude,
        googleMapsUrl: data.googleMapsUrl || null,
      },
      include: { category: true },
    });
  }

  static async updateLocation(id: bigint, data: Partial<CreateMapLocationDTO>) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.googleMapsUrl !== undefined) updateData.googleMapsUrl = data.googleMapsUrl;
    if (data.mapCategoryId !== undefined) updateData.mapCategoryId = BigInt(data.mapCategoryId);

    return prisma.mapLocation.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  }

  static async deleteLocation(id: bigint) {
    return prisma.mapLocation.delete({
      where: { id },
    });
  }

  static async createCategory(data: CreateMapCategoryDTO) {
    return prisma.mapCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || null,
        color: data.color || null,
      },
    });
  }

  static async updateCategory(id: bigint, data: Partial<CreateMapCategoryDTO>) {
    return prisma.mapCategory.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: bigint) {
    return prisma.mapCategory.delete({
      where: { id },
    });
  }
}
