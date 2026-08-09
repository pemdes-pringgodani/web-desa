import { AdminProfilService } from "../../../../modules/admin/admin-profil.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";
import { requireAdmin } from "../../../../shared/auth/require-admin";

export async function GET() {
  try {
    await requireAdmin();
    const data = await AdminProfilService.getProfil();
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Get admin profil error:", error);
    return ApiResponse.error("Terjadi kesalahan saat mengambil profil desa", 500);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = await AdminProfilService.updateProfil(body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error("Update admin profil error:", error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui profil desa", 500);
  }
}
