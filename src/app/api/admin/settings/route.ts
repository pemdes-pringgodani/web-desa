import { SettingsRepository } from "../../../../modules/settings/settings.repository";
import { ApiResponse } from "../../../../shared/utils/response";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    const raw = await SettingsRepository.getSetting();
    const data = {
      website_name: raw?.websiteName || "Desa Pringgodani",
      logo_url: raw?.logoUrl || "/images/logo-desa.png",
      favicon_url: raw?.faviconUrl || "/favicon.ico",
      contact_email: raw?.email || "info@pringgodani.desa.id",
      contact_phone: raw?.phone || "081234567890",
      address: raw?.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
      social_facebook: raw?.facebook || "",
      social_instagram: raw?.instagram || "",
      social_youtube: raw?.youtube || "",
      social_tiktok: raw?.tiktok || "",
      jumlah_dusun: 4,
      // Compatibility aliases
      websiteName: raw?.websiteName || "Desa Pringgodani",
      logoUrl: raw?.logoUrl || "/images/logo-desa.png",
      faviconUrl: raw?.faviconUrl || "/favicon.ico",
      contactEmail: raw?.email || "info@pringgodani.desa.id",
      contactPhone: raw?.phone || "081234567890",
      socialFacebook: raw?.facebook || "",
      socialInstagram: raw?.instagram || "",
      socialYoutube: raw?.youtube || "",
      socialTiktok: raw?.tiktok || "",
    };
    return ApiResponse.success(data);
  } catch (error: any) {
    console.error("Get admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil pengaturan website", 500);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const websiteName = body.website_name || body.websiteName;
    const logoUrl = body.logo_url || body.logoUrl;
    const faviconUrl = body.favicon_url || body.faviconUrl;
    const email = body.contact_email || body.contactEmail || body.email;
    const phone = body.contact_phone || body.contactPhone || body.phone;
    const address = body.address;
    const facebook = body.social_facebook || body.socialFacebook || body.facebook;
    const instagram = body.social_instagram || body.socialInstagram || body.instagram;
    const youtube = body.social_youtube || body.socialYoutube || body.youtube;
    const tiktok = body.social_tiktok || body.socialTiktok || body.tiktok;

    await SettingsRepository.updateSetting({
      websiteName,
      logoUrl,
      faviconUrl,
      email,
      phone,
      address,
      facebook,
      instagram,
      youtube,
      tiktok,
    });

    const updated = await SettingsRepository.getSetting();
    const data = {
      website_name: updated?.websiteName || "Desa Pringgodani",
      logo_url: updated?.logoUrl || "/images/logo-desa.png",
      favicon_url: updated?.faviconUrl || "/favicon.ico",
      contact_email: updated?.email || "info@pringgodani.desa.id",
      contact_phone: updated?.phone || "081234567890",
      address: updated?.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
      social_facebook: updated?.facebook || "",
      social_instagram: updated?.instagram || "",
      social_youtube: updated?.youtube || "",
      social_tiktok: updated?.tiktok || "",
      jumlah_dusun: 4,
    };
    return ApiResponse.success(data, "Pengaturan website berhasil diperbarui");
  } catch (error: any) {
    console.error("Update admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui pengaturan website", 500);
  }
}
