import { UmkmRepository, FindAllUmkmParams } from "./umkm.repository";
import { RegisterUmkmDTO, registerUmkmSchema } from "./umkm.schema";
import { generateCategorySlug, generateUmkmSlug } from "../../shared/utils/slug";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";
import { prisma } from "../../shared/db/client";

// UMKM service for management and public discovery

export class UmkmService {
  static async getCategories(includeAll = false) {
    const categories = await UmkmRepository.findAllCategories(includeAll);
    return { items: categories };
  }

  static async getUmkmById(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID UMKM tidak valid");
    }
    const u = await prisma.umkm.findUnique({
      where: { id },
      include: {
        category: true,
        potential: true,
        galleries: true,
        products: true,
      },
    });

    if (!u) {
      throw new NotFoundError(`UMKM dengan ID '${idStr}' tidak ditemukan`);
    }

    return {
      id: u.id.toString(),
      name: u.name,
      slug: u.slug,
      umkmCategoryId: u.umkmCategoryId.toString(),
      categoryName: u.category?.name || "UMKM",
      categorySlug: u.category?.slug || "umkm",
      description: u.description,
      phone: u.phone,
      email: u.email,
      address: u.address,
      mapsUrl: u.mapsUrl,
      ownerName: u.ownerName,
      coverUrl: u.coverUrl || "/images/placeholder-umkm.jpg",
      status: u.status,
      since: u.since,
      openDay: u.openDay,
      startTime: u.startTime ? u.startTime.toISOString().substring(11, 16) : null,
      endTime: u.endTime ? u.endTime.toISOString().substring(11, 16) : null,
      latitude: u.latitude ? Number(u.latitude) : null,
      longitude: u.longitude ? Number(u.longitude) : null,
      galleries: u.galleries.map((g) => ({
        id: g.id.toString(),
        imageUrl: g.imageUrl,
        caption: g.caption,
      })),
      products: u.products.map((p) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price ? Number(p.price) : 0,
        description: p.description,
        imageUrl: p.imageUrl,
      })),
    };
  }

  static async updateUmkm(idStr: string, input: any) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID UMKM tidak valid");
    }

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.umkm.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`UMKM dengan ID '${idStr}' tidak ditemukan`);
      }

      const updated = await tx.umkm.update({
        where: { id },
        data: {
          name: input.name ?? existing.name,
          ownerName: input.ownerName ?? existing.ownerName,
          description: input.description ?? existing.description,
          phone: input.phone ?? existing.phone,
          email: input.email !== undefined ? input.email : existing.email,
          address: input.address ?? existing.address,
          mapsUrl: input.mapsUrl !== undefined ? input.mapsUrl : existing.mapsUrl,
          coverUrl: input.coverUrl ?? existing.coverUrl,
          status: input.status ?? existing.status,
          rejectionReason: input.rejectionReason !== undefined ? input.rejectionReason : existing.rejectionReason,
          since: input.since !== undefined ? input.since : existing.since,
          openDay: input.openDay !== undefined ? input.openDay : existing.openDay,
          startTime: input.startTime ? new Date(`1970-01-01T${input.startTime}:00Z`) : existing.startTime,
          endTime: input.endTime ? new Date(`1970-01-01T${input.endTime}:00Z`) : existing.endTime,
          latitude: input.latitude !== undefined ? Number(input.latitude) : existing.latitude,
          longitude: input.longitude !== undefined ? Number(input.longitude) : existing.longitude,
          publishedAt: input.status === "APPROVED" && !existing.publishedAt ? new Date() : existing.publishedAt,
        },
      });

      if (input.galleries) {
        await tx.umkmGallery.deleteMany({ where: { umkmId: id } });
        if (input.galleries.length > 0) {
          await tx.umkmGallery.createMany({
            data: input.galleries.map((g: any) => ({
              umkmId: id,
              imageUrl: typeof g === "string" ? g : g.imageUrl,
              caption: typeof g === "string" ? null : g.caption || null,
            })),
          });
        }
      }

      if (input.products) {
        await tx.product.deleteMany({ where: { umkmId: id } });
        if (input.products.length > 0) {
          await tx.product.createMany({
            data: input.products.map((prod: any) => ({
              umkmId: id,
              name: prod.name,
              description: prod.description,
              price: prod.price !== undefined && prod.price !== null ? prod.price : null,
              imageUrl: prod.imageUrl || null,
            })),
          });
        }
      }

      return updated;
    });

    return result;
  }

  static async getAllUmkm(params: FindAllUmkmParams) {
    return UmkmRepository.findAllPaginated(params);
  }

  static async getUmkmBySlug(slug: string) {
    const umkm = await UmkmRepository.findBySlug(slug);
    if (!umkm) {
      throw new NotFoundError(`UMKM dengan slug '${slug}' tidak ditemukan`);
    }
    return umkm;
  }

  static async deleteUmkm(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID UMKM tidak valid");
    }
    return UmkmRepository.deleteUmkm(id);
  }

  static async registerUmkm(input: unknown) {
    // 1. Validate payload
    const validation = registerUmkmSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0].message,
        validation.error.flatten()
      );
    }

    const data: RegisterUmkmDTO = validation.data;

    if (data.umkmCategoryId === "other" && (!data.newCategoryName || !data.newCategoryName.trim())) {
      throw new ValidationError("Nama kategori baru wajib diisi jika memilih Lainnya");
    }

    // 2. Process within transaction
    const result = await UmkmRepository.executeTransaction(async (tx) => {
      let finalCategoryId: bigint;

      if (data.umkmCategoryId === "other") {
        const cleanedName = data.newCategoryName!.trim();
        const existingCat = await UmkmRepository.findCategoryByName(cleanedName, tx);

        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const catSlug = await generateCategorySlug(cleanedName, tx);
          const newCat = await UmkmRepository.createCategory(
            { name: cleanedName, slug: catSlug },
            tx
          );
          finalCategoryId = newCat.id;
        }
      } else {
        if (!isNaN(Number(data.umkmCategoryId))) {
          finalCategoryId = BigInt(data.umkmCategoryId);
        } else {
          let cat = await tx.umkmCategory.findFirst({
            where: {
              OR: [
                { slug: data.umkmCategoryId.toLowerCase() },
                { name: { equals: data.umkmCategoryId, mode: "insensitive" } },
              ],
            },
          });
          if (!cat) {
            const catSlug = await generateCategorySlug(data.umkmCategoryId, tx);
            cat = await tx.umkmCategory.create({
              data: { name: data.umkmCategoryId, slug: catSlug },
            });
          }
          finalCategoryId = cat.id;
        }
      }

      let finalPotentialId: bigint | null = null;
      if (data.villagePotentialId) {
        if (!isNaN(Number(data.villagePotentialId))) {
          finalPotentialId = BigInt(data.villagePotentialId);
        } else {
          const pot = await tx.villagePotential.findFirst({
            where: {
              OR: [
                { slug: data.villagePotentialId.toLowerCase() },
                { name: { equals: data.villagePotentialId, mode: "insensitive" } },
              ],
            },
          });
          if (pot) finalPotentialId = pot.id;
        }
      }

      const slug = await generateUmkmSlug(data.name, tx);

      const umkm = await tx.umkm.create({
        data: {
          name: data.name,
          ownerName: data.ownerName,
          umkmCategoryId: finalCategoryId,
          villagePotentialId: finalPotentialId,
          description: data.description,
          phone: data.phone,
          email: data.email || null,
          coverUrl: data.coverUrl || "/images/placeholder-umkm.jpg",
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          mapsUrl: data.addressUrl || data.mapsUrl || null,
          since: data.since,
          openDay: data.openDay || null,
          startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}:00Z`) : null,
          endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}:00Z`) : null,
          status: "PENDING",
          slug,
        },
      });

      if (data.galleries && data.galleries.length > 0) {
        await tx.umkmGallery.createMany({
          data: data.galleries.map((url) => ({
            umkmId: umkm.id,
            imageUrl: url,
          })),
        });
      }

      if (data.products && data.products.length > 0) {
        await tx.product.createMany({
          data: data.products.map((prod) => ({
            umkmId: umkm.id,
            name: prod.name,
            description: prod.description,
            price: prod.price !== undefined && prod.price !== null ? prod.price : null,
            imageUrl: prod.imageUrl || null,
          })),
        });
      }

      return umkm;
    });

    return result;
  }
}
