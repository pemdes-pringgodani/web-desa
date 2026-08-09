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
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
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
