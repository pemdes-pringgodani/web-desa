import { createClient, createAdminClient } from "../supabase/server";
import { prisma } from "../db/client";
import { UnauthorizedError, AppError } from "../errors/app-error";

export class ForbiddenError extends AppError {
  constructor(message: string = "Akses ditolak: Anda bukan admin") {
    super(message, 403);
    this.name = "ForbiddenError";
  }
}

export async function requireAdmin() {
  const { headers, cookies } = await import("next/headers");
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  let user: { id: string; email?: string } | null = null;

  // 1. Primary: Verify Authorization Bearer Token if present
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "").trim();
    if (token) {
      try {
        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && data?.user) {
          user = data.user;
        }
      } catch (err) {
        console.error("Failed to verify bearer token:", err);
      }
    }
  }

  // 2. Secondary: Fallback to Supabase SSR Client cookie
  if (!user) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        user = data.user;
      }
    } catch {
      // ignore
    }
  }

  // 3. If user is authenticated via Bearer token or Supabase SSR cookie, check DB role
  if (user) {
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          ...(user.email ? [{ email: user.email }] : []),
        ],
      },
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

  // 4. Fallback 3: Check admin session cookie if Bearer token and Supabase user are null
  try {
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

