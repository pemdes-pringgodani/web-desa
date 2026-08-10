import { PotentialsService } from "../../../../../modules/potentials/potentials.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const potential = await PotentialsService.getPotentialBySlug(slug);
    const response = ApiResponse.success(potential);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get potential by slug error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil detail potensi desa", 500);
  }
}
