import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const roles = ["admin", "editor", "commenter", "viewer"] as const;

export const list = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const board = await ctx.db.get(args.boardId);
    if (!board) return [];
    return ctx.db.query("boardShares").withIndex("by_board", (q) => q.eq("boardId", args.boardId)).collect();
  },
});

export const upsert = mutation({
  args: {
    boardId: v.id("boards"),
    memberId: v.string(),
    memberName: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("commenter"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");
    if (!roles.includes(args.role)) throw new Error("Invalid role");

    const targetId = args.memberId.trim().toLowerCase();
    const displayName = args.memberName.trim() || targetId;

    const existing = await ctx.db.query("boardShares").withIndex("by_member_board", (q) => q.eq("memberId", targetId).eq("boardId", args.boardId)).unique();
    if (existing) {
      await ctx.db.patch(existing._id, { memberName: displayName, role: args.role });
      await ctx.db.insert("notifications", { recipientId: targetId, orgId: board.orgId, boardId: args.boardId, actorId: identity.subject, message: `Your board access was updated to ${args.role}.`, read: false, createdAt: Date.now() });
      return existing._id;
    }
    const shareId = await ctx.db.insert("boardShares", { boardId: args.boardId, orgId: board.orgId, memberId: targetId, memberName: displayName, role: args.role, invitedBy: identity.subject });
    await ctx.db.insert("notifications", { recipientId: targetId, orgId: board.orgId, boardId: args.boardId, actorId: identity.subject, message: `You were added to a board as ${args.role}.`, read: false, createdAt: Date.now() });
    return shareId;
  },
});

export const remove = mutation({
  args: { boardId: v.id("boards"), memberId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");
    const targetId = args.memberId.trim().toLowerCase();
    const existing = await ctx.db.query("boardShares").withIndex("by_member_board", (q) => q.eq("memberId", targetId).eq("boardId", args.boardId)).unique();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getAccess = query({
  args: {
    boardId: v.id("boards"),
    token: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const board = await ctx.db.get(args.boardId);
    if (!board) return null;
    if (board.authorId === identity.subject) {
      return { role: "owner" as const, canWrite: true, canComment: true };
    }

    const bySubject = await ctx.db.query("boardShares").withIndex("by_member_board", (q) => q.eq("memberId", identity.subject.toLowerCase()).eq("boardId", args.boardId)).unique();
    const byEmail = identity.email ? await ctx.db.query("boardShares").withIndex("by_member_board", (q) => q.eq("memberId", identity.email!.toLowerCase()).eq("boardId", args.boardId)).unique() : null;
    const share = bySubject || byEmail;

    if (share) {
      return {
        role: share.role,
        canWrite: share.role === "admin" || share.role === "editor",
        canComment: share.role !== "viewer",
      };
    }

    if (args.token) {
      const link = await ctx.db.query("shareLinks").withIndex("by_token", (q) => q.eq("token", args.token!)).unique();
      if (link && link.boardId === args.boardId) {
        return {
          role: link.role,
          canWrite: link.role === "editor",
          canComment: link.role !== "viewer",
        };
      }
    }

    if (args.role === "viewer") {
      return { role: "viewer" as const, canWrite: false, canComment: false };
    }
    if (args.role === "commenter") {
      return { role: "commenter" as const, canWrite: false, canComment: true };
    }

    if (board.orgId === identity.org_id) {
      return { role: "editor" as const, canWrite: true, canComment: true };
    }

    // Default for direct link
    return { role: "editor" as const, canWrite: true, canComment: true };
  },
});

export const getOrCreateLink = mutation({
  args: {
    boardId: v.id("boards"),
    role: v.union(v.literal("editor"), v.literal("commenter"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    const existing = await ctx.db
      .query("shareLinks")
      .withIndex("by_board_role", (q) => q.eq("boardId", args.boardId).eq("role", args.role))
      .first();

    if (existing) {
      return existing;
    }

    const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const linkId = await ctx.db.insert("shareLinks", {
      boardId: args.boardId,
      orgId: board.orgId,
      role: args.role,
      token,
      createdBy: identity.subject,
      createdAt: Date.now(),
    });

    return {
      _id: linkId,
      boardId: args.boardId,
      orgId: board.orgId,
      role: args.role,
      token,
      createdBy: identity.subject,
      createdAt: Date.now(),
    };
  },
});

export const listLinks = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const board = await ctx.db.get(args.boardId);
    if (!board) return [];

    return await ctx.db
      .query("shareLinks")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
  },
});

export const claimLink = mutation({
  args: {
    boardId: v.id("boards"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("Board not found");

    const link = await ctx.db
      .query("shareLinks")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!link || link.boardId !== args.boardId) {
      throw new Error("Invalid share link");
    }

    if (board.authorId === identity.subject) {
      return { role: "owner" as const };
    }

    const memberId = identity.subject.toLowerCase();
    const displayName = identity.name || identity.email?.split("@")[0] || memberId;

    const existing = await ctx.db
      .query("boardShares")
      .withIndex("by_member_board", (q) => q.eq("memberId", memberId).eq("boardId", args.boardId))
      .unique();

    if (existing) {
      // If user already has an admin/owner role, don't downgrade
      if (existing.role === "admin" || (existing.role === "editor" && link.role !== "editor")) {
        return { role: existing.role };
      }
      await ctx.db.patch(existing._id, { role: link.role });
      return { role: link.role };
    }

    await ctx.db.insert("boardShares", {
      boardId: args.boardId,
      orgId: board.orgId,
      memberId,
      memberName: displayName,
      role: link.role,
      invitedBy: link.createdBy,
    });

    return { role: link.role };
  },
});