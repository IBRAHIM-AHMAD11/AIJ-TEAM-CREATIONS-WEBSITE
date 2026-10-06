import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { useQuery } from "convex/react";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

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
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    inventoryCount: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    images: v.array(v.string()),
    isActive: v.optional(v.boolean()), // 👈 optional now (drafts force false anyway)
    video: v.optional(v.string()),
    model3d: v.optional(v.string()),
    features: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("color"), v.literal("size"), v.literal("material"),
                        v.literal("dimension"), v.literal("finish"), v.literal("custom")),
          label: v.string(),
          unit: v.optional(v.string()),
          value: v.string(),
          priceAdjustment: v.optional(v.number()),
        })
      )
    ),
    asDraft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new ConvexError("Not authenticated");
    const user = userId ? await ctx.db.get(userId) : null;
    if (!user || user.role !== "admin") throw new ConvexError("Admins only");

    const allowDrafts = process.env.ALLOW_DRAFTS === "true";
    const wantsDraft = args.asDraft === true;

    const title = args.title?.trim();
    const description = args.description?.trim();
    const price = args.price ?? 0;
    const images = (args.images ?? []).filter((u) => u?.trim()); // drop empty strings

    const complete =
      !!title && !!description && price > 0 && !!args.categoryId && images.length > 0; // 👈 images required to publish

    if (!complete && (!allowDrafts || !wantsDraft)) {
      throw new ConvexError("Missing required fields: title, description, price, category, and at least one image.");
    }
    const isDraft = allowDrafts && (wantsDraft || !complete);

    const slug = args.slug?.trim()
      || (isDraft ? `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}` : "");
    if (!slug) throw new ConvexError("Slug is required.");

    // 👉 re-add YOUR existing duplicate title/slug check HERE

    return await ctx.db.insert("products", {
      title: title || "Untitled Draft",
      slug,
      description: description || "",
      price: complete ? Math.round(price) : 0,
      inventoryCount: args.inventoryCount ?? 0,
      categoryId: args.categoryId,
      images,
      video: args.video,
      features: args.features ?? [],
      isActive: isDraft ? false : (args.isActive ?? true),
      model3d: args.model3d,
      status: isDraft ? "draft" : "published",
      createdAt: Date.now(),
    });
  },
});

const extractStorageId = (url: string): string | null => {
  if (!url.includes("api/storage/")) return null;
  const id = url.split("api/storage/")[1]?.split("?")[0];
  return id ?? null;
};

export async function deleteProductWithAssets(ctx: any, id: any) {
  const product = await ctx.db.get(id);
  if (!product) return;

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

  // Clean up video
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

  // Clean up 3D model
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

  // Delete product record
  await ctx.db.delete(id);
}

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await deleteProductWithAssets(ctx, args.id);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    inventoryCount: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    images: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    video: v.optional(v.string()),
    model3d: v.optional(v.string()),
    features: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("color"), v.literal("size"), v.literal("material"),
                        v.literal("dimension"), v.literal("finish"), v.literal("custom")),
          label: v.string(),
          unit: v.optional(v.string()),
          value: v.string(),
          priceAdjustment: v.optional(v.number()),
        })
      )
    ),
    asDraft: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // same auth pattern you just put in createProduct
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new ConvexError("Admins only");

    const existing = await ctx.db.get(args.id);
    if (!existing) throw new ConvexError("Product not found");

    const allowDrafts = process.env.ALLOW_DRAFTS === "true";

    // merge: new value if provided, otherwise keep what's already in the DB
    const title = args.title !== undefined ? args.title.trim() : existing.title;
    const description = args.description !== undefined ? args.description.trim() : existing.description;
    const price = args.price ?? existing.price;
    const categoryId = args.categoryId ?? existing.categoryId;
    const images = args.images ?? existing.images ?? [];
    const inventoryCount = args.inventoryCount ?? existing.inventoryCount;
    const features = args.features ?? existing.features ?? [];

    const complete = !!title && !!description && price > 0 && !!categoryId && images.length > 0;

    if (!complete && !allowDrafts) {
      throw new ConvexError("Still missing required fields (title, description, price, category, image), and drafts are disabled.");
    }
    // saving a COMPLETE product publishes it; incomplete only stays draft if drafts are allowed
    const isDraft = allowDrafts && (args.asDraft === true || !complete);

    const slug = args.slug?.trim() || existing.slug;

    // 👉 if your original updateProduct had a duplicate title/slug check, re-add it here
    // (only when slug/title actually changed)

    await ctx.db.patch(args.id, {
      title: title || "Untitled Draft",
      slug,
      description: description || "",
      price: complete ? Math.round(price) : 0,
      inventoryCount,
      categoryId,
      images,
      video: args.video !== undefined ? args.video : existing.video,
      model3d: args.model3d !== undefined ? args.model3d : existing.model3d,
      features,
      isActive: isDraft ? false : (args.isActive ?? existing.isActive ?? true),
      status: isDraft ? "draft" : "published",
    });
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