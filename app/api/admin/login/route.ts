import { NextResponse } from "next/server";
import { createSession, isValidPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!isValidPassword(password || "")) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
