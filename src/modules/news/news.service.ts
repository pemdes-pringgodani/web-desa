import { NewsRepository, FindAllNewsParams } from "./news.repository";
import { CreateNewsDTO, UpdateNewsDTO, baseCreateNewsSchema, updateNewsSchema } from "./news.schema";
import { generateNewsTypeSlug, generateNewsSlug, generateNewsCategorySlug } from "../../shared/utils/slug";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";
import { prisma } from "../../shared/db/client";

export class NewsService {
  static async getCategories(includeAll = false) {
    const categories = await NewsRepository.findAllCategories(includeAll);
    return { items: categories };
  }

  static async getTypes() {
    return NewsRepository.findAllTypes();
  }

  static async getAllNews(params: FindAllNewsParams = {}) {
    return NewsRepository.findAllPaginated(params);
  }

  static async getNewsBySlug(slug: string) {
    const news = await NewsRepository.findBySlug(slug);
    if (!news) {
      throw new NotFoundError(`Berita dengan slug '${slug}' tidak ditemukan`);
    }
    return news;
  }

  static async getNewsById(idStr: string) {
    const news = await NewsRepository.findById(idStr);
    if (!news) {
      throw new NotFoundError(`Berita dengan ID '${idStr}' tidak ditemukan`);
    }
    return news;
  }

  static async deleteNews(idStr: string) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID berita tidak valid");
    }
    return NewsRepository.deleteNews(id);
  }

  static async createNews(input: unknown) {
    const validation = baseCreateNewsSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0].message,
        validation.error.flatten()
      );
    }

    const data: CreateNewsDTO = validation.data;

    const result = await NewsRepository.executeTransaction(async (tx) => {
      // 1. Handle Category
      let finalCategoryId: bigint;
      if (data.newsCategoryId === "other") {
        const cleanedCatName = (data.newCategoryName || "Kabar UMKM").trim();
        const existingCat = await NewsRepository.findCategoryByName(cleanedCatName, tx);
        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const catSlug = await generateNewsCategorySlug(cleanedCatName, tx);
          const newCat = await NewsRepository.createCategory({ name: cleanedCatName, slug: catSlug }, tx);
          finalCategoryId = newCat.id;
        }
      } else {
        if (!isNaN(Number(data.newsCategoryId))) {
          finalCategoryId = BigInt(data.newsCategoryId);
        } else {
          let cat = await tx.newsCategory.findFirst({
            where: {
              OR: [
                { slug: data.newsCategoryId.toLowerCase() },
                { name: { equals: data.newsCategoryId, mode: "insensitive" } },
              ],
            },
          });
          if (!cat) {
            const catSlug = await generateNewsCategorySlug(data.newsCategoryId, tx);
            cat = await tx.newsCategory.create({
              data: { name: data.newsCategoryId, slug: catSlug },
            });
          }
          finalCategoryId = cat.id;
        }
      }

      // 2. Handle Type
      let finalTypeId: bigint;
      if (data.newsTypeId === "other") {
        const cleanedTypeName = (data.newTypeName || "Artikel").trim();
        const existingType = await NewsRepository.findTypeByName(cleanedTypeName, tx);
        if (existingType) {
          finalTypeId = existingType.id;
        } else {
          const typeSlug = await generateNewsTypeSlug(cleanedTypeName, tx);
          const newType = await NewsRepository.createType(
            { name: cleanedTypeName, slug: typeSlug },
            tx
          );
          finalTypeId = newType.id;
        }
      } else if (isNaN(Number(data.newsTypeId))) {
        const targetSlug = data.newsTypeId.toLowerCase();
        let existingType = await tx.newsType.findFirst({
          where: {
            OR: [{ slug: targetSlug }, { name: { equals: data.newsTypeId, mode: "insensitive" } }],
          },
        });
        if (existingType) {
          finalTypeId = existingType.id;
        } else {
          const firstType = await tx.newsType.findFirst();
          finalTypeId = firstType ? firstType.id : BigInt(1);
        }
      } else {
        finalTypeId = BigInt(data.newsTypeId);
      }

      const slug = await generateNewsSlug(data.title, tx);

      // 3. Create News record
      const news = await tx.news.create({
        data: {
          title: data.title,
          slug,
          newsCategoryId: finalCategoryId,
          newsTypeId: finalTypeId,
          excerpt: data.excerpt,
          coverUrl: data.coverUrl || null,
          status: data.status || "PUBLISHED",
          publishedAt: data.publishedAt || new Date(),
        },
      });

      // 4. Create ArticleDetail & Blocks if blocks provided
      if (data.blocks && data.blocks.length > 0) {
        const articleDetail = await tx.articleDetail.create({
          data: {
            newsId: news.id,
          },
        });

        await tx.articleBlock.createMany({
          data: data.blocks.map((block, idx) => ({
            articleDetailId: articleDetail.id,
            subHeading: block.subHeading || null,
            content: block.content,
            imageUrl: block.imageUrl || null,
            sortOrder: block.sortOrder ?? idx + 1,
          })),
        });
      }

      // 5. Create GalleryDetail & Images if galleryImages provided
      if (data.galleryImages && data.galleryImages.length > 0) {
        const galleryDetail = await tx.galleryDetail.create({
          data: {
            newsId: news.id,
          },
        });

        await tx.galleryImage.createMany({
          data: data.galleryImages.map((img, idx) => ({
            galleryDetailId: galleryDetail.id,
            imageUrl: img.imageUrl,
            imageDescription: img.imageDescription || null,
            sortOrder: img.sortOrder ?? idx + 1,
          })),
        });
      }

      // 6. Tagged Many-to-Many Relations
      if (data.taggedUmkmIds && data.taggedUmkmIds.length > 0) {
        await tx.newsUmkm.createMany({
          data: data.taggedUmkmIds.map((uId) => ({
            newsId: news.id,
            umkmId: BigInt(uId),
          })),
          skipDuplicates: true,
        });
      }

      if (data.taggedProductIds && data.taggedProductIds.length > 0) {
        await tx.newsProduct.createMany({
          data: data.taggedProductIds.map((pId) => ({
            newsId: news.id,
            productId: BigInt(pId),
          })),
          skipDuplicates: true,
        });
      }

      if (data.taggedPotentialIds && data.taggedPotentialIds.length > 0) {
        await tx.newsPotential.createMany({
          data: data.taggedPotentialIds.map((potId) => ({
            newsId: news.id,
            potentialId: BigInt(potId),
          })),
          skipDuplicates: true,
        });
      }

      return {
        id: news.id.toString(),
        slug: news.slug,
        title: news.title,
      };
    });

    return result;
  }

  static async updateNews(idStr: string, input: unknown) {
    let id: bigint;
    try {
      id = BigInt(idStr);
    } catch {
      throw new NotFoundError("ID berita tidak valid");
    }

    const validation = updateNewsSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError("Data pembaruan berita tidak valid", validation.error.flatten());
    }

    const payload = validation.data;

    const result = await NewsRepository.executeTransaction(async (tx) => {
      const existing = await tx.news.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError(`Berita dengan ID '${idStr}' tidak ditemukan`);
      }

      const updateData: any = {};
      if (payload.title) updateData.title = payload.title;
      if (payload.excerpt) updateData.excerpt = payload.excerpt;
      if (payload.coverUrl !== undefined) updateData.coverUrl = payload.coverUrl;
      if (payload.status) updateData.status = payload.status;
      if (payload.publishedAt) updateData.publishedAt = payload.publishedAt;
      if (payload.newsCategoryId) updateData.newsCategoryId = BigInt(payload.newsCategoryId);
      if (payload.newsTypeId) updateData.newsTypeId = BigInt(payload.newsTypeId);

      const updated = await tx.news.update({
        where: { id },
        data: updateData,
      });

      // Update blocks
      if (payload.blocks) {
        let art = await tx.articleDetail.findUnique({ where: { newsId: id } });
        if (!art) {
          art = await tx.articleDetail.create({ data: { newsId: id } });
        } else {
          await tx.articleBlock.deleteMany({ where: { articleDetailId: art.id } });
        }

        if (payload.blocks.length > 0) {
          await tx.articleBlock.createMany({
            data: payload.blocks.map((block, idx) => ({
              articleDetailId: art.id,
              subHeading: block.subHeading || null,
              content: block.content,
              imageUrl: block.imageUrl || null,
              sortOrder: block.sortOrder ?? idx + 1,
            })),
          });
        }
      }

      // Update galleryImages
      if (payload.galleryImages) {
        let gal = await tx.galleryDetail.findUnique({ where: { newsId: id } });
        if (!gal) {
          gal = await tx.galleryDetail.create({ data: { newsId: id } });
        } else {
          await tx.galleryImage.deleteMany({ where: { galleryDetailId: gal.id } });
        }

        if (payload.galleryImages.length > 0) {
          await tx.galleryImage.createMany({
            data: payload.galleryImages.map((img, idx) => ({
              galleryDetailId: gal.id,
              imageUrl: img.imageUrl,
              imageDescription: img.imageDescription || null,
              sortOrder: img.sortOrder ?? idx + 1,
            })),
          });
        }
      }

      // Update tagged relations
      if (payload.taggedUmkmIds) {
        await tx.newsUmkm.deleteMany({ where: { newsId: id } });
        if (payload.taggedUmkmIds.length > 0) {
          await tx.newsUmkm.createMany({
            data: payload.taggedUmkmIds.map((uId) => ({
              newsId: id,
              umkmId: BigInt(uId),
            })),
            skipDuplicates: true,
          });
        }
      }

      if (payload.taggedProductIds) {
        await tx.newsProduct.deleteMany({ where: { newsId: id } });
        if (payload.taggedProductIds.length > 0) {
          await tx.newsProduct.createMany({
            data: payload.taggedProductIds.map((pId) => ({
              newsId: id,
              productId: BigInt(pId),
            })),
            skipDuplicates: true,
          });
        }
      }

      if (payload.taggedPotentialIds) {
        await tx.newsPotential.deleteMany({ where: { newsId: id } });
        if (payload.taggedPotentialIds.length > 0) {
          await tx.newsPotential.createMany({
            data: payload.taggedPotentialIds.map((potId) => ({
              newsId: id,
              potentialId: BigInt(potId),
            })),
            skipDuplicates: true,
          });
        }
      }

      return {
        id: updated.id.toString(),
        slug: updated.slug,
        title: updated.title,
      };
    });

    return result;
  }
}
