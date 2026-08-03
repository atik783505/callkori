import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { headers } from "next/headers";
import type { Filter, Document } from "mongodb";

// GET /api/friends — friend list + incoming requests + search users
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db();
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search");

  if (query) {
    // Search users by name or email (excluding self)
    const users = await db
      .collection("user")
      .find(
        {
          $and: [
            { _id: { $ne: userId } },
            {
              $or: [
                { name: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
              ],
            },
          ],
        } as Filter<Document>,
        { projection: { name: 1, email: 1, image: 1 } }
      )
      .limit(10)
      .toArray();

    // Get existing friend/request status for each user
    const userIdList = users.map((u) => String(u._id));
    const statuses = await db
      .collection("friendRequests")
      .find({
        $or: [
          { from: userId, to: { $in: userIdList } },
          { to: userId, from: { $in: userIdList } },
        ],
      })
      .toArray();

    const result = users.map((u) => {
      const sid = String(u._id);
      const rel = statuses.find(
        (s) => (s.from === userId && s.to === sid) || (s.to === userId && s.from === sid)
      );
      return {
        id: sid,
        name: u.name,
        email: u.email,
        image: u.image ?? null,
        status: rel ? rel.status : "none",
        direction: rel ? (rel.from === userId ? "sent" : "received") : null,
      };
    });

    return NextResponse.json({ users: result });
  }

  // Get accepted friends
  const friendDocs = await db
    .collection("friendRequests")
    .find({ $or: [{ from: userId }, { to: userId }], status: "accepted" })
    .toArray();

  const friendIds = friendDocs.map((f) => (f.from === userId ? f.to : f.from));

  const friends = friendIds.length
    ? await db
        .collection("user")
        .find(
          { _id: { $in: friendIds } } as Filter<Document>,
          { projection: { name: 1, email: 1, image: 1 } }
        )
        .toArray()
    : [];

  // Get incoming pending requests
  const incoming = await db
    .collection("friendRequests")
    .find({ to: userId, status: "pending" })
    .toArray();

  const incomingIds = incoming.map((r) => r.from);
  const incomingUsers = incomingIds.length
    ? await db
        .collection("user")
        .find(
          { _id: { $in: incomingIds } } as Filter<Document>,
          { projection: { name: 1, email: 1, image: 1 } }
        )
        .toArray()
    : [];

  const incomingWithMeta = incoming.map((r) => {
    const u = incomingUsers.find((u) => String(u._id) === r.from);
    return {
      requestId: String(r._id),
      from: r.from,
      name: u?.name ?? null,
      email: u?.email ?? null,
      image: u?.image ?? null,
    };
  });

  return NextResponse.json({
    friends: friends.map((f) => ({
      id: String(f._id),
      name: f.name,
      email: f.email,
      image: f.image ?? null,
    })),
    incoming: incomingWithMeta,
  });
}

// POST /api/friends — send friend request
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { toUserId } = await req.json();
  if (!toUserId) return NextResponse.json({ error: "toUserId required" }, { status: 400 });

  const client = await clientPromise;
  const db = client.db();
  const userId = session.user.id;

  if (userId === toUserId)
    return NextResponse.json({ error: "নিজেকে রিকোয়েস্ট পাঠানো যাবে না" }, { status: 400 });

  const existing = await db.collection("friendRequests").findOne({
    $or: [
      { from: userId, to: toUserId },
      { from: toUserId, to: userId },
    ],
  });

  if (existing)
    return NextResponse.json({ error: "ইতিমধ্যে রিকোয়েস্ট আছে" }, { status: 409 });

  await db.collection("friendRequests").insertOne({
    from: userId,
    to: toUserId,
    status: "pending",
    createdAt: new Date(),
  });

  return NextResponse.json({ success: true });
}

// PATCH /api/friends — accept or decline
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, action } = await req.json();
  if (!requestId || !["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db();
  const { ObjectId } = await import("mongodb");

  let oid: InstanceType<typeof ObjectId>;
  try {
    oid = new ObjectId(requestId);
  } catch {
    return NextResponse.json({ error: "Invalid requestId" }, { status: 400 });
  }

  const request = await db.collection("friendRequests").findOne({ _id: oid });
  if (!request || request.to !== session.user.id) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  if (action === "accept") {
    await db
      .collection("friendRequests")
      .updateOne({ _id: oid }, { $set: { status: "accepted", updatedAt: new Date() } });
  } else {
    await db.collection("friendRequests").deleteOne({ _id: oid });
  }

  return NextResponse.json({ success: true });
}
