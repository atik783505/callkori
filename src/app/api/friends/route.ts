import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";

// better-auth stores users with _id as ObjectId.
// session.user.id = String(_id).
// friendRequests stores from/to as String(_id).

function toObjectId(v: string): ObjectId | null {
  try { return new ObjectId(v); } catch { return null; }
}

// Lookup users by their string id (= String(_id))
async function getUsersByStringIds(db: any, ids: string[]) {
  if (!ids.length) return [];
  const oids = ids.map(toObjectId).filter(Boolean) as ObjectId[];
  if (!oids.length) return [];
  return db
    .collection("user")
    .find(
      { _id: { $in: oids } },
      { projection: { _id: 1, name: 1, email: 1, image: 1 } }
    )
    .toArray();
}

// GET /api/friends
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db();
  const userId = session.user.id; // String(_id)

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search");

  // ── SEARCH ──────────────────────────────────────────────
  if (query) {
    const users = await db
      .collection("user")
      .find(
        {
          $or: [
            { name:  { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
        { projection: { _id: 1, name: 1, email: 1, image: 1 } }
      )
      .limit(20)
      .toArray();

    // Normalise and exclude self
    const normalised = users
      .map(u => ({
        id:    String(u._id),
        name:  u.name  ?? null,
        email: u.email ?? null,
        image: u.image ?? null,
      }))
      .filter(u => u.id !== userId)
      .slice(0, 10);

    const idList = normalised.map(u => u.id);

    const statuses = await db
      .collection("friendRequests")
      .find({
        $or: [
          { from: userId, to: { $in: idList } },
          { to: userId,   from: { $in: idList } },
        ],
      })
      .toArray();

    const result = normalised.map(u => {
      const rel = statuses.find(
        s => (s.from === userId && s.to === u.id) ||
             (s.to   === userId && s.from === u.id)
      );
      return {
        ...u,
        status:    rel ? rel.status : "none",
        direction: rel ? (rel.from === userId ? "sent" : "received") : null,
      };
    });

    return NextResponse.json({ users: result });
  }

  // ── FRIEND LIST ──────────────────────────────────────────
  const friendDocs = await db
    .collection("friendRequests")
    .find({
      $or: [{ from: userId }, { to: userId }],
      status: "accepted",
    })
    .toArray();

  const friendIds = friendDocs
    .map(f => f.from === userId ? f.to : f.from)
    .filter(Boolean) as string[];

  const friendUsers = await getUsersByStringIds(db, friendIds);

  // ── INCOMING REQUESTS ────────────────────────────────────
  const incoming = await db
    .collection("friendRequests")
    .find({ to: userId, status: "pending" })
    .toArray();

  const incomingFromIds = incoming.map(r => r.from).filter(Boolean) as string[];
  const incomingUsers   = await getUsersByStringIds(db, incomingFromIds);

  const incomingWithMeta = incoming.map(r => {
    const u = incomingUsers.find((u: any) => String(u._id) === r.from);
    return {
      requestId: String(r._id),
      from:      r.from,
      name:      u?.name  ?? r.from,
      email:     u?.email ?? null,
      image:     u?.image ?? null,
    };
  });

  return NextResponse.json({
    friends: friendUsers.map((f: any) => ({
      id:    String(f._id),
      name:  f.name  ?? null,
      email: f.email ?? null,
      image: f.image ?? null,
    })),
    incoming: incomingWithMeta,
  });
}

// POST /api/friends — send friend request
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const toUserId = String(body.toUserId ?? "");
  if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });

  const client  = await clientPromise;
  const db      = client.db();
  const userId  = session.user.id;

  if (userId === toUserId)
    return NextResponse.json({ error: "নিজেকে রিকোয়েস্ট পাঠানো যাবে না" }, { status: 400 });

  // Verify recipient exists by _id
  const oid = toObjectId(toUserId);
  if (!oid) return NextResponse.json({ error: "Invalid user id" }, { status: 400 });

  const recipient = await db.collection("user").findOne({ _id: oid });
  if (!recipient)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const canonicalTo = String(recipient._id);

  // Check duplicate
  const existing = await db.collection("friendRequests").findOne({
    $or: [
      { from: userId,      to: canonicalTo },
      { from: canonicalTo, to: userId },
    ],
  });
  if (existing)
    return NextResponse.json({ error: "ইতিমধ্যে রিকোয়েস্ট আছে" }, { status: 409 });

  await db.collection("friendRequests").insertOne({
    from:      userId,
    to:        canonicalTo,
    status:    "pending",
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/friends — accept or decline
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { requestId, action } = body;
  if (!requestId || !["accept","decline"].includes(action))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const client = await clientPromise;
  const db     = client.db();
  const userId = session.user.id;

  const oid = toObjectId(requestId);
  if (!oid) return NextResponse.json({ error: "Invalid requestId" }, { status: 400 });

  const request = await db.collection("friendRequests").findOne({ _id: oid });
  if (!request)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(request.to) !== userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (action === "accept") {
    await db.collection("friendRequests").updateOne(
      { _id: oid },
      { $set: { status: "accepted", updatedAt: new Date() } }
    );
  } else {
    await db.collection("friendRequests").deleteOne({ _id: oid });
  }

  return NextResponse.json({ success: true });
}
