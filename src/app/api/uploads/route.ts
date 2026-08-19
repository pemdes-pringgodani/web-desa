import { StorageService } from "../../../modules/storage/storage.service";
import { ApiResponse } from "../../../shared/utils/response";
import { AppError } from "../../../shared/errors/app-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const categoryParam =
      searchParams.get("category") ||
      searchParams.get("folder") ||
      (formData.get("category") as string | null) ||
      (formData.get("folder") as string | null) ||
      undefined;

    const result = await StorageService.uploadFile(file, categoryParam);
    return ApiResponse.success(result, "File berhasil diunggah", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Upload API error:", error);
    return ApiResponse.error(
      error?.message || "Terjadi kesalahan saat mengunggah berkas",
      500
    );
  }
}

