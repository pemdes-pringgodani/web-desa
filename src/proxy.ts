import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3000",
];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Server-to-server or same-origin requests

  const configuredFrontend = process.env.FRONTEND_URL?.trim();
  const corsAllowedEnv = process.env.CORS_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) || [];

  const allowedSet = new Set<string>();

  if (configuredFrontend) {
    allowedSet.add(configuredFrontend);
  }

  corsAllowedEnv.forEach((o) => allowedSet.add(o));

  // In development, also include localhost dev ports
  if (process.env.NODE_ENV !== "production") {
    DEFAULT_DEV_ORIGINS.forEach((o) => allowedSet.add(o));
  }

  return allowedSet.has(origin);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const acceptHeader = request.headers.get("accept") || "";
  const fetchMode = request.headers.get("sec-fetch-mode") || "";
  const allowed = isOriginAllowed(origin);
  const matchedOrigin = allowed && origin ? origin : (process.env.FRONTEND_URL || "");

  // 1. Block Direct Browser Address Bar Navigation to Admin API Routes
  if (
    pathname.startsWith("/api/admin/") &&
    (fetchMode === "navigate" || (acceptHeader.includes("text/html") && !origin))
  ) {
    return NextResponse.json(
      { success: false, error: "Direct browser HTML navigation to Admin API endpoints is strictly prohibited." },
      { status: 403 }
    );
  }

  // 2. Handle Preflight OPTIONS request instantly
  if (pathname.startsWith("/api/") && request.method === "OPTIONS") {
    if (!allowed) {
      return new NextResponse(null, { status: 403 });
    }
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": matchedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Api-Version",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Log API Requests
  if (pathname.startsWith("/api/")) {
    const timestamp = new Date().toLocaleTimeString("id-ID");
    const query = request.nextUrl.search;
    console.log(`[${timestamp}] 🚀 ${request.method} ${pathname}${query}`);
  }

  // 3. Run Supabase Session Refresh for ALL requests to handle cookies properly
  let supabaseResponse = NextResponse.next({ request });

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              );
              supabaseResponse = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            },
          },
        }
      );
      await supabase.auth.getUser();
    } catch (err) {
      console.warn("Supabase auth session refresh warning:", err);
    }
  }

  // 4. Inject CORS headers for API requests only if origin is allowed
  if (pathname.startsWith("/api/") && allowed && origin) {
    supabaseResponse.headers.set("Access-Control-Allow-Origin", matchedOrigin);
    supabaseResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    supabaseResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Api-Version");
    supabaseResponse.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
