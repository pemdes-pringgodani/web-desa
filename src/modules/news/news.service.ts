import { NewsRepository, FindAllNewsParams } from "./news.repository";
import { createNewsSchema, CreateNewsDTO } from "./news.schema";
import { generateNewsTypeSlug, generateNewsSlug } from "../../shared/utils/slug";
import { ValidationError, NotFoundError } from "../../shared/errors/app-error";

export class NewsService {
  static async getCategories() {
    const categories = await NewsRepository.findAllCategories();
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

  static async createNews(input: unknown) {
    // 1. Validate payload
    const validation = createNewsSchema.safeParse(input);
    if (!validation.success) {
      throw new ValidationError(
        validation.error.issues[0].message,
        validation.error.flatten()
      );
    }

    const data: CreateNewsDTO = validation.data;

    if (data.newsCategoryId === "other" && (!data.newCategoryName || !data.newCategoryName.trim())) {
      throw new ValidationError("Nama kategori baru wajib diisi jika memilih Lainnya");
    }

    if (data.newsTypeId === "other" && (!data.newTypeName || !data.newTypeName.trim())) {
      throw new ValidationError("Nama tipe berita baru wajib diisi jika memilih Lainnya");
    }

    // 2. Process within transaction
    const result = await NewsRepository.executeTransaction(async (tx) => {
      // a. Handle Category
      let finalCategoryId: bigint;
      if (data.newsCategoryId === "other") {
        const cleanedCatName = data.newCategoryName!.trim();
        const existingCat = await NewsRepository.findCategoryByName(cleanedCatName, tx);
        if (existingCat) {
          finalCategoryId = existingCat.id;
        } else {
          const newCat = await NewsRepository.createCategory({ name: cleanedCatName }, tx);
          finalCategoryId = newCat.id;
        }
      } else {
        finalCategoryId = BigInt(data.newsCategoryId);
      }

      // b. Handle Type
      let finalTypeId: bigint;
      if (data.newsTypeId === "other") {
        const cleanedTypeName = data.newTypeName!.trim();
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
      } else {
        finalTypeId = BigInt(data.newsTypeId);
      }

      const finalPotentialId = data.villagePotentialId
        ? BigInt(data.villagePotentialId)
        : null;

      const slug = await generateNewsSlug(data.title, tx);

      // c. Create News base record
      const news = await tx.news.create({
        data: {
          title: data.title,
          slug,
          newsCategoryId: finalCategoryId,
          newsTypeId: finalTypeId,
          villagePotentialId: finalPotentialId,
          excerpt: data.excerpt,
          status: data.status || "PUBLISHED",
          publishedAt: data.publishedAt || new Date(),
        },
      });

      // d. Create Article Details & Blocks if provided
      if (data.article) {
        const articleDetail = await tx.articleDetail.create({
          data: {
            newsId: news.id,
            title: data.article.title || data.title,
            coverUrl: data.article.coverUrl,
          },
        });

        if (data.article.blocks && data.article.blocks.length > 0) {
          await tx.articleBlock.createMany({
            data: data.article.blocks.map((block, idx) => ({
              articleDetailId: articleDetail.id,
              subHeading: block.subHeading || null,
              content: block.content,
              imageUrl: block.imageUrl || null,
              sortOrder: block.sortOrder ?? idx + 1,
            })),
          });
        }
      }

      // e. Create Gallery Details & Images if provided
      if (data.gallery) {
        const galleryDetail = await tx.galleryDetail.create({
          data: {
            newsId: news.id,
            title: data.gallery.title || data.title,
            coverUrl: data.gallery.coverUrl,
          },
        });

        if (data.gallery.images && data.gallery.images.length > 0) {
          await tx.galleryImage.createMany({
            data: data.gallery.images.map((img, idx) => ({
              galleryDetailId: galleryDetail.id,
              imageUrl: img.imageUrl,
              imageDescription: img.imageDescription || null,
              sortOrder: img.sortOrder ?? idx + 1,
            })),
          });
        }
      }

      return {
        id: news.id.toString(),
        slug: news.slug,
        title: news.title,
      };
    });

    return result;
  }
}
