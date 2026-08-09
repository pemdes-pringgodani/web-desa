import { PotentialsService } from "../../../../modules/potentials/potentials.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET() {
  try {
    const potentials = await PotentialsService.getAllPotentials();
    return ApiResponse.success(potentials);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar potensi desa", 500);
  }
}
