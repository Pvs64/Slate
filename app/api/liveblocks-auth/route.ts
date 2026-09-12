import { auth, currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET!,
});

export async function POST(request: Request) {
  const authorization = await auth();
  const user = await currentUser();

  if (!user) {
    return new Response("Unauthorized", { status: 403 });
  }

  const convexToken = await authorization.getToken({ template: "convex" });
  if (!convexToken) {
    return new Response("Unauthorized", { status: 403 });
  }
  convex.setAuth(convexToken);

  const { room, token, role } = await request.json();

  const board = await convex.query(api.board.get, {
    id: room,
  });

  const access = await convex.query(api.shares.getAccess, {
    boardId: room,
    token: token || undefined,
    role: role || undefined,
  });

  if (!board || !access) {
    return new Response("Unauthorized", { status: 403 });
  }

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      name: user.fullName || user.username || "Teammate",
      picture: user.imageUrl,
    },
  });

  if (access.role === "viewer") {
    session.allow(room, ["room:read", "room:presence:write", "comments:read"]);
  } else if (access.role === "commenter") {
    session.allow(room, ["room:read", "room:presence:write", "comments:read", "comments:write"]);
  } else {
    session.allow(room, session.FULL_ACCESS);
  }

  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
