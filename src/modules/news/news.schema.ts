import { z } from "zod";

export const articleBlockSchema = z.object({
  subHeading: z.string().nullable().optional(),
  content: z.string().min(1, "Konten artikel (paragraf) wajib diisi"),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.preprocess(
    (val) => (val === undefined || val === null ? 0 : Number(val)),
    z.number().int()
  ),
});

export const articleDetailSchema = z.object({
  title: z.string().min(1, "Judul artikel wajib diisi"),
  coverUrl: z.string().min(1, "Cover artikel wajib diunggah"),
  blocks: z.array(articleBlockSchema).optional(),
});

export const galleryImageSchema = z.object({
  imageUrl: z.string().min(1, "URL foto galeri wajib diisi"),
  imageDescription: z.string().nullable().optional(),
  sortOrder: z.preprocess(
    (val) => (val === undefined || val === null ? 0 : Number(val)),
    z.number().int()
  ),
});

export const galleryDetailSchema = z.object({
  title: z.string().min(1, "Judul galeri foto wajib diisi"),
  coverUrl: z.string().min(1, "Cover galeri wajib diunggah"),
  images: z.array(galleryImageSchema).optional(),
});

const baseCreateNewsSchema = z
  .object({
    title: z.string().min(1, "Judul berita wajib diisi"),
    newsCategoryId: z.preprocess(
      (val) => String(val),
      z.string().min(1, "Kategori berita wajib dipilih")
    ),
    newCategoryName: z.string().optional().nullable(),
    newsTypeId: z.preprocess(
      (val) => String(val),
      z.string().min(1, "Tipe berita wajib dipilih")
    ),
    newTypeName: z.string().optional().nullable(),
    villagePotentialId: z.preprocess(
      (val) => (val ? String(val) : null),
      z.string().nullable().optional()
    ),
    excerpt: z.string().min(1, "Ringkasan berita (excerpt) wajib diisi"),
    status: z.string().default("PENDING"),
    publishedAt: z.preprocess(
      (val) => (val ? new Date(String(val)) : new Date()),
      z.date().optional()
    ),
    article: articleDetailSchema.optional().nullable(),
    gallery: galleryDetailSchema.optional().nullable(),
  })
  .refine(
    (data) =>
      (data.article && data.article.blocks && data.article.blocks.length > 0) ||
      (data.gallery && data.gallery.images && data.gallery.images.length > 0),
    {
      message: "Konten berita harus memiliki minimal detail artikel (dengan paragraf) atau galeri foto",
      path: ["article"],
    }
  );

export const createNewsSchema = z.preprocess((val: any) => {
  if (val && typeof val === "object") {
    const raw = { ...val };

    // Set default status PENDING if not specified
    if (!raw.status) {
      raw.status = "PENDING";
    }

    // Auto map flat blocks to article object
    if (Array.isArray(raw.blocks) && raw.blocks.length > 0 && !raw.article) {
      raw.article = {
        title: raw.title || "",
        coverUrl: raw.coverUrl || "/images/placeholder-news.jpg",
        blocks: raw.blocks
          .filter((b: any) => b && b.content && b.content.trim())
          .map((b: any, idx: number) => ({
            subHeading: b.subHeading || null,
            content: b.content || "",
            imageUrl: b.imageUrl || null,
            sortOrder: b.sortOrder ?? idx + 1,
          })),
      };
    }

    // Auto map flat galleryImages to gallery object
    if (Array.isArray(raw.galleryImages) && raw.galleryImages.length > 0 && !raw.gallery) {
      raw.gallery = {
        title: raw.title || "",
        coverUrl: raw.coverUrl || "/images/placeholder-news.jpg",
        images: raw.galleryImages
          .filter((g: any) => g && g.imageUrl && g.imageUrl.trim())
          .map((g: any, idx: number) => ({
            imageUrl: g.imageUrl || "",
            imageDescription: g.imageDescription || null,
            sortOrder: g.sortOrder ?? idx + 1,
          })),
      };
    }

    return raw;
  }
  return val;
}, baseCreateNewsSchema);

export const getNewsQuerySchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});

export type CreateNewsDTO = z.infer<typeof baseCreateNewsSchema>;
export type GetNewsQueryDTO = z.infer<typeof getNewsQuerySchema>;
