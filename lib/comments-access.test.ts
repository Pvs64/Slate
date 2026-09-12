import { describe, expect, it } from "vitest";

interface MockComment {
  id: string;
  userId: string;
  createdAt: string | number | Date;
}

interface MockThread {
  id: string;
  resolved: boolean;
  comments: MockComment[];
}

function calculateUnreadCommentsCount({
  threads,
  isOpen,
  lastReadTimestamp,
  currentUserId,
}: {
  threads: MockThread[];
  isOpen: boolean;
  lastReadTimestamp: number;
  currentUserId?: string;
}): number {
  if (isOpen) return 0;

  const openThreads = threads.filter((t) => !t.resolved);

  if (!lastReadTimestamp) {
    return openThreads.reduce((acc, thread) => {
      const others = thread.comments.filter((c) => c.userId !== currentUserId);
      return acc + others.length;
    }, 0);
  }

  return openThreads.reduce((acc, thread) => {
    const unread = thread.comments.filter((c) => {
      const commentTime = new Date(c.createdAt).getTime();
      return commentTime > lastReadTimestamp && c.userId !== currentUserId;
    });
    return acc + unread.length;
  }, 0);
}

function getRolePermissions(role: "owner" | "admin" | "editor" | "commenter" | "viewer") {
  return {
    canWrite: role === "owner" || role === "admin" || role === "editor",
    canComment: role !== "viewer",
  };
}

describe("comments unread counter logic", () => {
  const baseTime = 1000000;
  const mockThreads: MockThread[] = [
    {
      id: "thread-1",
      resolved: false,
      comments: [
        { id: "c1", userId: "user-1", createdAt: baseTime + 100 },
        { id: "c2", userId: "user-2", createdAt: baseTime + 200 },
      ],
    },
    {
      id: "thread-2",
      resolved: false,
      comments: [
        { id: "c3", userId: "me", createdAt: baseTime + 300 }, // own comment
      ],
    },
    {
      id: "thread-3",
      resolved: true, // resolved thread
      comments: [
        { id: "c4", userId: "user-1", createdAt: baseTime + 400 },
      ],
    },
  ];

  it("returns 0 unread comments when comments panel is open", () => {
    const count = calculateUnreadCommentsCount({
      threads: mockThreads,
      isOpen: true,
      lastReadTimestamp: baseTime,
      currentUserId: "me",
    });
    expect(count).toBe(0);
  });

  it("calculates unread comments for other users while excluding own comments and resolved threads", () => {
    const count = calculateUnreadCommentsCount({
      threads: mockThreads,
      isOpen: false,
      lastReadTimestamp: baseTime,
      currentUserId: "me",
    });
    // c1 and c2 are from others in open threads after baseTime. c3 is by "me", c4 is in a resolved thread.
    expect(count).toBe(2);
  });

  it("returns 0 after reading comments (updating lastReadTimestamp)", () => {
    const count = calculateUnreadCommentsCount({
      threads: mockThreads,
      isOpen: false,
      lastReadTimestamp: baseTime + 500, // all read
      currentUserId: "me",
    });
    expect(count).toBe(0);
  });

  it("only shows number when a new comment occurs after last read timestamp", () => {
    const updatedThreads: MockThread[] = [
      ...mockThreads,
      {
        id: "thread-4",
        resolved: false,
        comments: [
          { id: "c5", userId: "user-2", createdAt: baseTime + 600 },
        ],
      },
    ];

    const count = calculateUnreadCommentsCount({
      threads: updatedThreads,
      isOpen: false,
      lastReadTimestamp: baseTime + 500,
      currentUserId: "me",
    });
    expect(count).toBe(1);
  });
});

describe("role permission mappings", () => {
  it("restricts viewer to read-only for canvas and comments", () => {
    const permissions = getRolePermissions("viewer");
    expect(permissions.canWrite).toBe(false);
    expect(permissions.canComment).toBe(false);
  });

  it("permits commenter to participate in comments while restricting canvas edits", () => {
    const permissions = getRolePermissions("commenter");
    expect(permissions.canWrite).toBe(false);
    expect(permissions.canComment).toBe(true);
  });

  it("permits editor full access to canvas and comments", () => {
    const permissions = getRolePermissions("editor");
    expect(permissions.canWrite).toBe(true);
    expect(permissions.canComment).toBe(true);
  });
});
