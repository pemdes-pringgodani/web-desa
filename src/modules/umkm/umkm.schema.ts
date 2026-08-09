import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().min(1, "Deskripsi produk wajib diisi"),
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().nullable().optional()
  ),
  imageUrl: z.string().nullable().optional(),
});

export const registerUmkmSchema = z.object({
  name: z.string().min(1, "Nama UMKM wajib diisi"),
  ownerName: z.string().min(1, "Nama pemilik wajib diisi"),
  umkmCategoryId: z.preprocess(
    (val) => String(val),
    z.string().min(1, "Kategori UMKM wajib dipilih")
  ),
  newCategoryName: z.string().optional().nullable(),
  villagePotentialId: z.preprocess(
    (val) => (val ? String(val) : null),
    z.string().nullable().optional()
  ),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  phone: z.string().min(1, "Nomor WhatsApp wajib diisi"),
  email: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().email("Format email tidak valid").nullable().optional()
  ),
  coverUrl: z.string().min(1, "Cover wajib diunggah"),
  address: z.string().min(1, "Alamat wajib diisi"),
  addressUrl: z.string().nullable().optional(),
  googlePlaceId: z.string().nullable().optional(),
  latitude: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? -7.98 : Number(val)),
    z.number().optional()
  ),
  longitude: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 112.63 : Number(val)),
    z.number().optional()
  ),
  since: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().nullable().optional()
  ),
  openDay: z.string().nullable().optional(),
  startTime: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam buka tidak valid (HH:MM)").nullable().optional()
  ),
  endTime: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam tutup tidak valid (HH:MM)").nullable().optional()
  ),
  galleries: z.array(z.string()).optional(),
  products: z.array(productSchema).optional(),
});

export type RegisterUmkmDTO = z.infer<typeof registerUmkmSchema>;
