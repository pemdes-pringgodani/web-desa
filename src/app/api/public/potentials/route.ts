import { PotentialsService } from "../../../../modules/potentials/potentials.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET() {
  try {
    const potentials = await PotentialsService.getAllPotentials();
    const response = ApiResponse.success(potentials);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar potensi desa", 500);
  }
}
