import { StorageService } from "../../../modules/storage/storage.service";
import { ApiResponse } from "../../../shared/utils/response";
import { AppError } from "../../../shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    const result = await StorageService.uploadFile(file);
    return ApiResponse.success(result, "File berhasil diunggah", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Upload API error:", error);
    return ApiResponse.error("Terjadi kesalahan internal pada server", 500);
  }
}
