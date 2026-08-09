import { UmkmService } from "../../../../../modules/umkm/umkm.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function GET() {
  try {
    const categories = await UmkmService.getCategories();
    return ApiResponse.success(categories);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil kategori UMKM", 500);
  }
}
