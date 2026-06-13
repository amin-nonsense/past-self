import { NextRequest, NextResponse } from "next/server";
import { loadUserData } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });
  const data = await loadUserData(pin);
  return NextResponse.json({ data });
}
