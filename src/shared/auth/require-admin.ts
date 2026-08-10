import { createClient } from "../supabase/server";
import { prisma } from "../db/client";
import { UnauthorizedError, AppError } from "../errors/app-error";

export class ForbiddenError extends AppError {
  constructor(message: string = "Akses ditolak: Anda bukan admin") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export async function requireAdmin() {
  const supabase = await createClient();
  let { data: { user }, error } = await supabase.auth.getUser();

  // Fallback: Check admin session cookie if Supabase SSR user is null
  if (error || !user) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("pringgodani_admin_session")?.value;
      if (sessionCookie) {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        if (parsed?.email) {
          const dbUser = await prisma.user.findFirst({
            where: { email: parsed.email },
            include: { role: true },
          });
          if (dbUser) {
            const roleName = dbUser.role?.name?.toUpperCase();
            if (roleName === "ADMIN" || roleName === "SUPER_ADMIN" || roleName === "SUPERADMIN") {
              return dbUser;
            }
          }
        }
      }
    } catch {
      // ignore parse error
    }
    throw new UnauthorizedError("Pengguna belum terautentikasi");
  }

  // Query database lokal untuk memverifikasi role dari database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  if (!dbUser) {
    throw new UnauthorizedError("Data pengguna tidak terdaftar di sistem");
  }

  const roleName = dbUser.role?.name?.toUpperCase();
  if (roleName !== "ADMIN" && roleName !== "SUPER_ADMIN" && roleName !== "SUPERADMIN") {
    throw new ForbiddenError();
  }

  return dbUser;
}
