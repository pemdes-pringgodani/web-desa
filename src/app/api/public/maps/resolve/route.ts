import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL Google Maps wajib diisi" },
        { status: 400 }
      );
    }

    // Follow redirects to resolve short link to long link.
    // Mimic desktop browser User-Agent to prevent getting blocked by basic anti-bot headers.
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const finalUrl = response.url;

    return NextResponse.json({
      success: true,
      finalUrl,
    });
  } catch (error: any) {
    console.error("Resolve Maps URL error:", error);
    return NextResponse.json(
      { error: `Gagal memproses URL Google Maps: ${error.message}` },
      { status: 500 }
    );
  }
}
