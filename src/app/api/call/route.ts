import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { headers } from "next/headers";
import { randomBytes } from "crypto";

// POST /api/call — caller creates a call invite for a friend
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId } = await req.json();
  if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });

  const roomId = "ck-" + randomBytes(3).toString("hex");
  const client = await clientPromise;
  const db = client.db();

  // Remove any old pending call between these two users
  await db.collection("callInvites").deleteMany({
    $or: [
      { from: session.user.id, to: toUserId },
      { from: toUserId, to: session.user.id },
    ],
  });

  await db.collection("callInvites").insertOne({
    from: session.user.id,
    fromName: session.user.name,
    to: toUserId,
    roomId,
    status: "ringing",
    createdAt: new Date(),
  });

  return NextResponse.json({ roomId });
}

// GET /api/call — check if there's an incoming call for the current user
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db();

  // Expire calls older than 60 seconds
  await db.collection("callInvites").deleteMany({
    createdAt: { $lt: new Date(Date.now() - 60_000) },
  });

  const invite = await db.collection("callInvites").findOne({
    to: session.user.id,
    status: "ringing",
  });

  if (!invite) return NextResponse.json({ call: null });

  return NextResponse.json({
    call: {
      id: String(invite._id),
      from: invite.from,
      fromName: invite.fromName,
      roomId: invite.roomId,
    },
  });
}

// PATCH /api/call — accept or decline
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { callId, action } = await req.json();
  const { ObjectId } = await import("mongodb");
  const client = await clientPromise;
  const db = client.db();

  let oid;
  try { oid = new ObjectId(callId); } catch {
    return NextResponse.json({ error: "Invalid callId" }, { status: 400 });
  }

  await db.collection("callInvites").deleteOne({ _id: oid });
  return NextResponse.json({ success: true, action });
}
