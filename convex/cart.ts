import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function getFeatureKey(
  features?: Array<{ type: string; label: string; value: string }>
): string {
  if (!features || features.length === 0) return "";
  return JSON.stringify(
    [...features].sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.label !== b.label) return a.label.localeCompare(b.label);
      return a.value.localeCompare(b.value);
    })
  );
}

export const getCart = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return { ...item, product };
      })
    );
  },
});

export const getCartCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
});

export const addItem = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    selectedFeatures: v.optional(
      v.array(
        v.object({
          type: v.string(),
          label: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const incomingKey = getFeatureKey(args.selectedFeatures);

    const userItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", args.productId)
      )
      .collect();

    const existing = userItems.find((item) => {
      const itemKey = getFeatureKey(item.selectedFeatures);
      return itemKey === incomingKey;
    });

    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
    } else {
      await ctx.db.insert("cartItems", {
        userId,
        productId: args.productId,
        quantity: args.quantity,
        selectedFeatures: args.selectedFeatures,
      });
    }
  },
});

export const updateQuantity = mutation({
  args: {
    id: v.id("cartItems"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.patch(args.id, { quantity: args.quantity });
    }
  },
});

export const removeItem = mutation({
  args: { id: v.id("cartItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.delete(args.id);
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
  },
});
