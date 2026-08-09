import { MapsService } from "../../../../../modules/maps/maps.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const searchQuery = searchParams.get("q") || undefined;

    const locations = await MapsService.getLocations(categorySlug, searchQuery);
    return ApiResponse.success(locations);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil lokasi peta", 500);
  }
}
