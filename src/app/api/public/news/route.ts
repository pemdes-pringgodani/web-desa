import { NewsService } from "../../../../modules/news/news.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 6;
    const category =
      searchParams.get("category") ||
      searchParams.get("categorySlug") ||
      searchParams.get("kategori") ||
      undefined;
    const type = searchParams.get("type") || undefined;
    const search =
      searchParams.get("search") ||
      searchParams.get("q") ||
      searchParams.get("cari") ||
      undefined;
    const exclude = searchParams.get("exclude") || undefined;
    const status = searchParams.get("status") || "PUBLISHED";
    const umkmSlug = searchParams.get("umkmSlug") || searchParams.get("umkm") || undefined;
    const potentialSlug = searchParams.get("potentialSlug") || searchParams.get("potential") || undefined;

    const news = await NewsService.getAllNews({
      page,
      limit,
      category,
      type,
      search,
      exclude,
      status,
      umkmSlug,
      potentialSlug,
    });
    const response = ApiResponse.success(news);
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat mengambil daftar berita", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await NewsService.createNews(body);

    return ApiResponse.success(
      result,
      "Berita berhasil dipublikasikan.",
      201
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create news error:", error);
    return ApiResponse.error(`Terjadi kesalahan saat membuat berita: ${error.message}`, 500);
  }
}
