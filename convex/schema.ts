import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    boards: defineTable({
        title: v.string(),
        orgId: v.string(),
        authorId: v.string(),
        authorName: v.string(),
        imageUrl: v.string(),
        template: v.optional(v.string()),
    })
    .index("by_org", ["orgId"])
    .searchIndex("search_title", {
        searchField: "title",
        filterFields: ["orgId"],
    }),
    userFavorites: defineTable({
        orgId: v.string(),
        userId: v.string(),
        boardId: v.id("boards"),
    })
    .index("by_board", ["boardId"])
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_board", ["userId", "boardId"])
    ,
    boardShares: defineTable({
        boardId: v.id("boards"),
        orgId: v.string(),
        memberId: v.string(),
        memberName: v.string(),
        role: v.union(v.literal("admin"), v.literal("editor"), v.literal("commenter"), v.literal("viewer")),
        invitedBy: v.string(),
    })
    .index("by_board", ["boardId"])
    .index("by_member_board", ["memberId", "boardId"]),
    notifications: defineTable({
        recipientId: v.string(),
        orgId: v.string(),
        boardId: v.optional(v.id("boards")),
        actorId: v.string(),
        message: v.string(),
        read: v.boolean(),
        createdAt: v.number(),
    })
    .index("by_recipient_org", ["recipientId", "orgId"]),
    shareLinks: defineTable({
        boardId: v.id("boards"),
        orgId: v.string(),
        role: v.union(v.literal("editor"), v.literal("commenter"), v.literal("viewer")),
        token: v.string(),
        createdBy: v.string(),
        createdAt: v.number(),
    })
    .index("by_board", ["boardId"])
    .index("by_token", ["token"])
    .index("by_board_role", ["boardId", "role"]),
});
