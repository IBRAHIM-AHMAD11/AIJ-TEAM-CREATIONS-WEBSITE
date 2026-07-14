import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Generates direct secure endpoint targets for file ingestion
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Resolves a storageId to a permanent, viewable CDN image link
export const getStorageUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});