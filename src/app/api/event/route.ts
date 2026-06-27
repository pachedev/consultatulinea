import { type NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await backendFetch("/events", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
