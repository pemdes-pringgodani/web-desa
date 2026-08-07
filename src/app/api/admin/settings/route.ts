import { SettingsService } from "../../../../modules/settings/settings.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await SettingsService.updateSettings(body);
    return ApiResponse.success(result, "Pengaturan website berhasil diperbarui");
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update admin settings error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui pengaturan website", 500);
  }
}
