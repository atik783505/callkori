import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { RtcTokenBuilder, RtcRole } from "agora-token";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const channelName = searchParams.get("channel");
  if (!channelName) return NextResponse.json({ error: "channel required" }, { status: 400 });

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
  const certificate = process.env.AGORA_APP_CERTIFICATE!;

  if (!appId || !certificate) {
    return NextResponse.json({ error: "Agora credentials missing" }, { status: 500 });
  }

  // Token valid for 1 hour
  const expirySeconds = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpire = currentTime + expirySeconds;

  // uid 0 = any uid can join
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    certificate,
    channelName,
    0,
    RtcRole.PUBLISHER,
    privilegeExpire,
    privilegeExpire
  );

  return NextResponse.json({ token });
}
