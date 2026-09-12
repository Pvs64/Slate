import {v} from "convex/values";

import {mutation, query} from "./_generated/server";

function canDeleteBoard(identity: { subject: string; org_id?: string }, board: { authorId: string; orgId: string }) {
    return board.authorId === identity.subject || (Boolean(identity.org_id) && board.orgId === identity.org_id);
}

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
  "/placeholders/11.svg",
  "/placeholders/12.svg",
  "/placeholders/13.svg",
  "/placeholders/14.svg",
  "/placeholders/15.svg",
  "/placeholders/16.svg",

]

export const create = mutation({
    args:{
        title: v.string(),
        orgId: v.string(),
        template: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }
        if (identity.org_id && identity.org_id !== args.orgId) {
            throw new Error("Forbidden");
        }

        const randomImage = images[Math.floor(Math.random() * images.length)];

        const board = await ctx.db.insert("boards", {
            title: args.title,
            orgId: args.orgId,
            imageUrl: randomImage,
            authorId: identity.subject,
            authorName: identity.name ?? "Anonymous",
            template: args.template,
        });

        return board;
    }
});


export const remove = mutation({
    args:{ id: v.id("boards")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);
        if(!board) {
            throw new Error("Board not found");
        }
        if(!canDeleteBoard(identity, board)) {
            throw new Error("Forbidden: only author or team members can delete this board");
        }

        const userId = identity.subject;

        const existingFavorite = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) =>
         q
         .eq("userId", userId)
         .eq("boardId", args.id)
        )
        .unique();

        if(existingFavorite){
            await ctx.db.delete(existingFavorite._id)
        }

        await ctx.db.delete(board._id);
    }
})


export const update = mutation({
    args: {id: v.id("boards"), title: v.string()},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new Error("Unauthorized")
        }
        const existingBoard = await ctx.db.get(args.id);
        if(!existingBoard) {
            throw new Error("Board not found");
        }
        const title = args.title.trim();

        if(!title){
            throw new Error("Title is required");
        }
        if(title.length > 60){
            throw new Error("Title cannot be longer than 60 characters")
        }

        const board = await ctx.db.patch(args.id, {
            title: args.title,
        });

        return board;
    }
})


export const favorite = mutation({
    args: {id: v.id("boards"), orgId: v.string()},
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if(!board){
            throw new Error("Board not found")
        }

        const userId = identity.subject;

        const existingFavorite = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) => 
         q
          .eq("userId", userId)
          .eq("boardId", board._id)
        )
        .unique();

        if(existingFavorite){
            throw new Error("Board already favorited")
        }

        await ctx.db.insert("userFavorites", {
            userId,
            boardId: board._id,
            orgId: args.orgId || board.orgId,
        });

        return board;
    }
})


export const unfavorite = mutation({
    args: {id: v.id("boards")},
    handler: async(ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity){
            throw new Error("Unauthorized");
        }

        const board = await ctx.db.get(args.id);

        if(!board){
            throw new Error("Board not found")
        }

        const userId = identity.subject;

        const existingFavorite = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_board", (q) => 
         q
          .eq("userId", userId)
          .eq("boardId", board._id)
        )
        .unique();

        if(!existingFavorite){
            throw new Error("Favourited board not found")
        }

        await ctx.db.delete(existingFavorite._id);

        return board;
    }
});

export const get = query({
    args: {id: v.id("boards")},
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
        }
        const board = await ctx.db.get(args.id);

        if (!board) return null;

        const userId = identity.subject;
        const favorite = await ctx.db
            .query("userFavorites")
            .withIndex("by_user_board", (q) =>
                q
                    .eq("userId", userId)
                    .eq("boardId", board._id)
            )
            .unique();

        return {
            ...board,
            isFavorite: !!favorite,
        };
    }
});