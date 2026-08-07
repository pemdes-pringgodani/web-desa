import { UmkmRepository, FindAllUmkmParams } from "./umkm.repository";
import { RegisterUmkmDTO, registerUmkmSchema } from "./umkm.schema";
import { generateCategorySlug, generateUmkmSlug } from "../../shared/utils/slug";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";

export class UmkmService {
  static async getCategories() {
    const categories = await UmkmRepository.findAllCategories();
    return { items: categories };
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
        finalCategoryId = BigInt(data.umkmCategoryId);
      }

      const finalPotentialId = data.villagePotentialId
        ? BigInt(data.villagePotentialId)
        : null;

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
          coverUrl: data.coverUrl,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          googlePlaceId: data.googlePlaceId || null,
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
            price: prod.price,
            imageUrl: prod.imageUrl || null,
          })),
        });
      }

      return umkm;
    });

    return result;
  }
}
