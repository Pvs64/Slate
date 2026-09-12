import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    if (identity.org_id && identity.org_id !== args.orgId) throw new Error("Forbidden");
    return ctx.db.query("notifications").withIndex("by_recipient_org", (q) => q.eq("recipientId", identity.subject).eq("orgId", args.orgId)).order("desc").take(20);
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const notification = await ctx.db.get(args.id);
    if (!notification || notification.recipientId !== identity.subject) throw new Error("Forbidden");
    await ctx.db.patch(args.id, { read: true });
  },
});