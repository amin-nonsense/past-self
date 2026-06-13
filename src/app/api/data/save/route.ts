import { NextRequest, NextResponse } from "next/server";
import { saveUserData } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const { pin, data } = await req.json();
  if (!pin) return NextResponse.json({ error: "PIN required" }, { status: 400 });
  await saveUserData(pin, data);
  return NextResponse.json({ ok: true });
}
