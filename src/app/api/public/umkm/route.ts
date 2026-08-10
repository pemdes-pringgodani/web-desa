import { UmkmService } from "../../../../modules/umkm/umkm.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 8;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const exclude = searchParams.get("exclude") || undefined;
    const status = searchParams.get("status") || undefined;

    const data = await UmkmService.getAllUmkm({
      page,
      limit,
      category,
      search,
      exclude,
      status,
    });

    const response = ApiResponse.success(data);
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get UMKM list error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar UMKM", 500);
  }
}
