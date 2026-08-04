import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { headers } from "next/headers";

// Helper: normalize any user id value to a plain string
function nid(v: unknown): string {
  return String(v ?? "");
}

// GET /api/friends — friend list + incoming requests + search
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db();
  const userId = nid(session.user.id);

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
        } as any,
        { projection: { id: 1, _id: 1, name: 1, email: 1, image: 1 } }
      )
      .limit(20)
      .toArray();

    // Normalise and exclude self
    const normalised = users
      .map((u) => ({
        id:    nid(u.id ?? u._id),
        name:  u.name  ?? null,
        email: u.email ?? null,
        image: u.image ?? null,
      }))
      .filter((u) => u.id && u.id !== userId)
      .slice(0, 10);

    const idList = normalised.map((u) => u.id);

    const statuses = await db
      .collection("friendRequests")
      .find({
        $or: [
          { from: userId, to: { $in: idList } },
          { to: userId, from: { $in: idList } },
        ],
      })
      .toArray();

    const result = normalised.map((u) => {
      const rel = statuses.find(
        (s) => (s.from === userId && s.to === u.id) ||
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

  const friendIds = friendDocs.map((f) =>
    f.from === userId ? nid(f.to) : nid(f.from)
  ).filter(Boolean);

  const friendUsers = friendIds.length
    ? await db
        .collection("user")
        .find(
          { $or: [{ id: { $in: friendIds } }, { _id: { $in: friendIds } }] } as any,
          { projection: { id: 1, _id: 1, name: 1, email: 1, image: 1 } }
        )
        .toArray()
    : [];

  // ── INCOMING REQUESTS ────────────────────────────────────
  const incoming = await db
    .collection("friendRequests")
    .find({ to: userId, status: "pending" })
    .toArray();

  const incomingIds = incoming.map((r) => nid(r.from)).filter(Boolean);

  const incomingUsers = incomingIds.length
    ? await db
        .collection("user")
        .find(
          { $or: [{ id: { $in: incomingIds } }, { _id: { $in: incomingIds } }] } as any,
          { projection: { id: 1, _id: 1, name: 1, email: 1, image: 1 } }
        )
        .toArray()
    : [];

  const incomingWithMeta = incoming.map((r) => {
    const fromId = nid(r.from);
    const u = incomingUsers.find(
      (u) => nid(u.id) === fromId || nid(u._id) === fromId
    );
    return {
      requestId: String(r._id),
      from:      fromId,
      name:      u?.name  ?? fromId,
      email:     u?.email ?? null,
      image:     u?.image ?? null,
    };
  });

  return NextResponse.json({
    friends: friendUsers.map((f) => ({
      id:    nid(f.id ?? f._id),
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
  const toUserId = nid(body.toUserId);
  if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const userId = nid(session.user.id);

  if (userId === toUserId)
    return NextResponse.json({ error: "নিজেকে রিকোয়েস্ট পাঠানো যাবে না" }, { status: 400 });

  // Verify recipient exists
  const recipient = await db.collection("user").findOne(
    { $or: [{ id: toUserId }, { _id: toUserId }] } as any
  );
  if (!recipient)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const canonicalToId = nid(recipient.id ?? recipient._id);

  // Check duplicate
  const existing = await db.collection("friendRequests").findOne({
    $or: [
      { from: userId, to: canonicalToId },
      { from: canonicalToId, to: userId },
    ],
  });
  if (existing)
    return NextResponse.json({ error: "ইতিমধ্যে রিকোয়েস্ট আছে" }, { status: 409 });

  await db.collection("friendRequests").insertOne({
    from:      userId,
    to:        canonicalToId,
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

  if (!requestId || !["accept", "decline"].includes(action))
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const { ObjectId } = await import("mongodb");
  const userId = nid(session.user.id);

  let oid: InstanceType<typeof ObjectId>;
  try { oid = new ObjectId(requestId); }
  catch { return NextResponse.json({ error: "Invalid requestId" }, { status: 400 }); }

  const request = await db.collection("friendRequests").findOne({ _id: oid });

  // Accept if recipient OR sender (to handle both directions)
  if (!request)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (nid(request.to) !== userId)
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
