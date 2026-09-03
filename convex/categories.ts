import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { deleteProductWithAssets } from "./products";
import { internal } from "./_generated/api";

const BATCH_SIZE = 50; // Keeps storage API calls and DB operations well under time limits

// Query to list all categories for your dropdown
export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    // Exclude categories marked for deletion
    return categories.filter((c) => !c.isDeleting);
  },
});

// Helper mutation to quickly insert a category
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

// Internal background worker for deleting products in chunks
export const removeBatch = internalMutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    // 1. Fetch only a fixed chunk of products
    const products = await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .take(BATCH_SIZE);

    // 2. Delete storage files and DB records for this chunk
    for (const product of products) {
      await deleteProductWithAssets(ctx, product._id);
    }

    // 3. If we hit the batch limit, schedule the next batch immediately
    if (products.length === BATCH_SIZE) {
      await ctx.scheduler.runAfter(0, internal.categories.removeBatch, {
        categoryId: args.categoryId,
      });
    } else {
      // 4. All products are gone; delete the category itself
      await ctx.db.delete(args.categoryId);
    }
  },
});

// Public mutation to start the asynchronous deletion process
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // 1. Mark as deleting so queries can hide it instantly in the UI
    await ctx.db.patch(args.id, { isDeleting: true });

    // 2. Queue background cleanup
    await ctx.scheduler.runAfter(0, internal.categories.removeBatch, {
      categoryId: args.id,
    });
  },
});