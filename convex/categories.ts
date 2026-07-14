// convex/categories.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to list all categories for your dropdown
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Helper mutation to quickly insert a category if you don't have one yet
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      name: args.name,
      slug: args.slug,
    });
  },
});