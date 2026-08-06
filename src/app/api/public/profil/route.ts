import { ProfileService } from "../../../../modules/profile/profile.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET() {
  try {
    const data = await ProfileService.getProfileWithStats();
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get profile error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil profil desa", 500);
  }
}
