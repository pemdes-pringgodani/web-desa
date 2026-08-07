import { AdminProfilService } from "../../../../../modules/admin/admin-profil.service";
import { ApiResponse } from "../../../../../shared/utils/response";
import { AppError } from "../../../../../shared/errors/app-error";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = await AdminProfilService.updateOfficial(id, body);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error(`Update official error:`, error);
    return ApiResponse.error("Terjadi kesalahan saat memperbarui perangkat desa", 500);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await AdminProfilService.deleteOfficial(id);
    return ApiResponse.success(data);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    console.error(`Delete official error:`, error);
    return ApiResponse.error("Terjadi kesalahan saat menghapus perangkat desa", 500);
  }
}
