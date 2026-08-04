import { AuthService } from "../../../../modules/auth/auth.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await AuthService.signIn(body);
    return ApiResponse.success(user, "Login berhasil", 200);
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat login", 500);
  }
}
