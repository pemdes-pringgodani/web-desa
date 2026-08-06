import { z } from "zod";

export const articleBlockSchema = z.object({
  subHeading: z.string().nullable().optional(), // Sub heading per block opsional
  content: z.string().min(1, "Konten artikel (paragraf) wajib diisi"),
  imageUrl: z.string().nullable().optional(), // Gambar pada paragraf opsional
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
  imageUrl: z.string().min(1, "URL foto galeri wajib diisi"), // Gambar pada galeri WAJIB
  imageDescription: z.string().nullable().optional(), // Deskripsi foto galeri opsional
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

export const createNewsSchema = z
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
    status: z.string().default("PUBLISHED"),
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

export const getNewsQuerySchema = z.object({
  category: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
});

export type CreateNewsDTO = z.infer<typeof createNewsSchema>;
export type GetNewsQueryDTO = z.infer<typeof getNewsQuerySchema>;
