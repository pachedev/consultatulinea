import { type NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { clientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await backendFetch("/reports", {
      method: "POST",
      body: JSON.stringify(body),
      // Sin esto el backend ve la IP del servidor de Next y el límite de
      // reportes por IP se vuelve global. La API exige API key, así que solo
      // este servidor puede fijar estos encabezados.
      headers: {
        "X-Client-IP": clientIp(req.headers),
        "X-Client-User-Agent": (req.headers.get("user-agent") ?? "").slice(
          0,
          400,
        ),
      },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
