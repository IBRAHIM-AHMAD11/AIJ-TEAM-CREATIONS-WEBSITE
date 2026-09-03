import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

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
    model3d: v.optional(v.string()),
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
          unit: v.optional(v.string()),
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

    if (product.model3d) {
      const storageId = extractStorageId(product.model3d);
      if (storageId) {
        try {
          await ctx.storage.delete(storageId as any);
        } catch (err) {
          console.error("Failed to delete 3D model storage asset:", err);
        }
      }
    }

    // Delete the product document from the database
    await ctx.db.delete(args.id);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    inventoryCount: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    isActive: v.boolean(),
    video: v.optional(v.string()),
    model3d: v.optional(v.string()),
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
          unit: v.optional(v.string()),
          value: v.string(),
          priceAdjustment: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    return await ctx.db.patch(id, data);
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("isActive", true))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories"), excludeId: v.optional(v.id("products")) },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("isActive", true))
      .collect();
    return products.filter((p) => p.categoryId === args.categoryId && p._id !== args.excludeId).slice(0, 4);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const product = await ctx.db.get(id);
      if (product) results.push(product);
    }
    return results;
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

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});