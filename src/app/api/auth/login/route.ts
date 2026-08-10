import { AuthService } from "../../../../modules/auth/auth.service";
import { ApiResponse } from "../../../../shared/utils/response";
import { AppError } from "../../../../shared/errors/app-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await AuthService.signIn(body);

    const serializedUser = encodeURIComponent(JSON.stringify({
      name: user.user_metadata?.name || user.name || "Admin Desa",
      email: user.email,
      role: "ADMIN",
    }));

    const response = ApiResponse.success(user, "Login berhasil", 200);
    response.headers.append(
      "Set-Cookie",
      `pringgodani_admin_session=${serializedUser}; Path=/; Max-Age=10800; Secure; SameSite=Lax`
    );
    return response;
  } catch (error: any) {
    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode, error.errors);
    }
    return ApiResponse.error("Terjadi kesalahan saat login", 500);
  }
}
