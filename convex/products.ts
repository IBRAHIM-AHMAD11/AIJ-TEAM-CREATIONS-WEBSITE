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
    features: v.optional(
      v.array(
        v.object({
          type: v.union(
            v.literal("color"),
            v.literal("size"),
            v.literal("material"),
            v.literal("dimension"),
            v.literal("finish"),
            v.literal("custom")
          ),
          label: v.string(),
          value: v.string(),
          priceAdjustment: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      createdAt: Date.now()
    })
  }
})

const extractStorageId = (url: string): string | null => {
  if (!url.includes("api/storage/")) return null;
  const id = url.split("api/storage/")[1]?.split("?")[0];
  return id ?? null;
};

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Clean up images from Convex Storage
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        const storageId = extractStorageId(imageUrl);
        if (storageId) {
          try {
            await ctx.storage.delete(storageId as any);
          } catch (err) {
            console.error("Failed to delete image storage asset:", err);
          }
        }
      }
    }

    // Clean up video if it's stored on Convex
    if (product.video) {
      const storageId = extractStorageId(product.video);
      if (storageId) {
        try {
          await ctx.storage.delete(storageId as any);
        } catch (err) {
          console.error("Failed to delete video storage asset:", err);
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

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique(); // Returns the product or null if not found
  },
});