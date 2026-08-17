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

export const galleryImageSchema = z.object({
  imageUrl: z.string().min(1, "URL foto galeri wajib diisi"),
  imageDescription: z.string().nullable().optional(),
  sortOrder: z.preprocess(
    (val) => (val === undefined || val === null ? 0 : Number(val)),
    z.number().int()
  ),
});

export const baseCreateNewsSchema = z.object({
  title: z.string().min(1, "Judul berita wajib diisi"),
  newsCategoryId: z.preprocess((val) => String(val), z.string().min(1, "Kategori berita wajib dipilih")),
  newCategoryName: z.string().optional().nullable(),
  newsTypeId: z.preprocess((val) => String(val), z.string().min(1, "Tipe berita wajib dipilih")),
  newTypeName: z.string().optional().nullable(),
  excerpt: z.string().min(1, "Ringkasan berita wajib diisi"),
  coverUrl: z.string().nullable().optional(),
  status: z.enum(["DRAFT", "PENDING", "PUBLISHED"]).default("PUBLISHED"),
  publishedAt: z.preprocess(
    (val) => (val ? new Date(String(val)) : new Date()),
    z.date().optional()
  ),
  blocks: z.array(articleBlockSchema).optional(),
  galleryImages: z.array(galleryImageSchema).optional(),
  taggedUmkmIds: z.array(z.string()).optional(),
  taggedProductIds: z.array(z.string()).optional(),
  taggedPotentialIds: z.array(z.string()).optional(),
});

export type CreateNewsDTO = z.infer<typeof baseCreateNewsSchema>;

export const updateNewsSchema = baseCreateNewsSchema.partial();
export type UpdateNewsDTO = z.infer<typeof updateNewsSchema>;
