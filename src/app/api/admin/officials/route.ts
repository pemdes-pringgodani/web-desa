import { AdminProfilService } from "../../../../modules/admin/admin-profil.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await AdminProfilService.addOfficial(body);
    return ApiResponse.success(data, "Perangkat desa berhasil ditambahkan", 201);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Create official error:", error);
    return ApiResponse.error("Terjadi kesalahan saat menambahkan perangkat desa", 500);
  }
}
