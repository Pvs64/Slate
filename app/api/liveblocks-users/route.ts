import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authorization = await auth();
  if (!authorization.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userIds = searchParams.getAll("userIds");

  if (!userIds || userIds.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const clerk = await clerkClient();
    const users = await Promise.all(
      userIds.map(async (id) => {
        try {
          const u = await clerk.users.getUser(id);
          const name =
            u.fullName ||
            [u.firstName, u.lastName].filter(Boolean).join(" ") ||
            u.username ||
            u.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
            "Teammate";
          return {
            name,
            picture: u.imageUrl || undefined,
          };
        } catch {
          return {
            name: "Teammate",
            picture: undefined,
          };
        }
      })
    );

    return NextResponse.json(users);
  } catch (err) {
    console.error("Error resolving Liveblocks users:", err);
    return NextResponse.json(
      userIds.map(() => ({ name: "Teammate", picture: undefined }))
    );
  }
}
