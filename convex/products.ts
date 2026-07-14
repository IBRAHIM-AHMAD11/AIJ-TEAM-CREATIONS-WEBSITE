import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    // Uses the "by_status" index to only grab active products
    return await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const createProduct = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(), // Remember: cents! ($10.00 = 1000)
    inventoryCount: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    isActive: v.boolean(),
    video: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      createdAt: Date.now()
    })
  }
})

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Optional: If you want to clean up uploaded images from Convex Storage to save space:
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        // Extract the storageId from the URL if it's hosted on Convex
        if (imageUrl.includes("api/storage/")) {
          const storageId = imageUrl.split("api/storage/")[1];
          if (storageId) {
            try {
              await ctx.storage.delete(storageId as any);
            } catch (err) {
              console.error("Failed to delete orphaned storage asset:", err);
            }
          }
        }
      }
    }

    // Delete the product document from the database
    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});