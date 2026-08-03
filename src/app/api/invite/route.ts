import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomBytes } from "crypto";

// POST /api/invite — generate a unique room invite link
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Generate a short unique room ID: e.g. "ck-a3f9b2"
  const roomId = "ck-" + randomBytes(3).toString("hex");
  const baseUrl = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const link = `${baseUrl}/room/${roomId}`;

  return NextResponse.json({ roomId, link });
}
