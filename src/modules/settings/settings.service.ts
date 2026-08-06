import { SettingsRepository } from "./settings.repository";

export class SettingsService {
  static async getSettings() {
    const raw = await SettingsRepository.getSetting();

    const settings: Record<string, unknown> = {
      website_name: raw?.websiteName || "Desa Pringgodani",
      logo_url: raw?.logoUrl || "/logo.png",
      favicon_url: raw?.faviconUrl || "/favicon.ico",
      contact_email: raw?.email || "info@pringgodani.desa.id",
      contact_phone: raw?.phone || "081234567890",
      address: raw?.address || "Jl. Raya Desa Pringgodani No. 1",
      social_facebook: raw?.facebook || null,
      social_instagram: raw?.instagram || null,
      social_youtube: raw?.youtube || null,
      social_tiktok: raw?.tiktok || null,
      jumlah_dusun: 4,
    };

    return { settings };
  }
}
