import { SettingsService } from "../../../../modules/settings/settings.service";
import { SettingsRepository } from "../../../../modules/settings/settings.repository";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET() {
  try {
    const raw = await SettingsRepository.getSetting();
    const data = {
      websiteName: raw?.websiteName || "Desa Pringgodani",
      contactEmail: raw?.email || "info@pringgodani.desa.id",
      contactPhone: raw?.phone || "081234567890",
      address: raw?.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
      socialFacebook: raw?.facebook || "",
      socialInstagram: raw?.instagram || "",
      socialYoutube: raw?.youtube || "",
      socialTiktok: raw?.tiktok || "",
    };
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil pengaturan website", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await SettingsRepository.updateSetting({
      websiteName: body.websiteName,
      email: body.contactEmail,
      phone: body.contactPhone,
      address: body.address,
      facebook: body.socialFacebook,
      instagram: body.socialInstagram,
      youtube: body.socialYoutube,
      tiktok: body.socialTiktok,
    });
    const updated = await SettingsRepository.getSetting();
    const data = {
      websiteName: updated?.websiteName || "Desa Pringgodani",
      contactEmail: updated?.email || "info@pringgodani.desa.id",
      contactPhone: updated?.phone || "081234567890",
      address: updated?.address || "Jl. Raya Desa Pringgodani No. 1, Bantur, Malang",
      socialFacebook: updated?.facebook || "",
      socialInstagram: updated?.instagram || "",
      socialYoutube: updated?.youtube || "",
      socialTiktok: updated?.tiktok || "",
    };
    return ApiResponse.success(data, "Pengaturan website berhasil diperbarui");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui pengaturan website", 500);
  }
}
