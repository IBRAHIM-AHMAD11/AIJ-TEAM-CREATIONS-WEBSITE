import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const order = await ctx.db.get(args.id);
    if (!order || order.userId !== userId) return null;
    return order;
  },
});

export const create = mutation({
  args: {
    checkoutSessionId: v.optional(v.id("checkoutSessions")),
    items: v.array(
      v.object({
        productId: v.id("products"),
        title: v.string(),
        price: v.number(),
        quantity: v.number(),
        image: v.optional(v.string()),
        selectedFeatures: v.optional(
          v.array(
            v.object({
              type: v.string(),
              label: v.string(),
              value: v.string(),
            })
          )
        ),
      })
    ),
    subtotal: v.number(),
    shippingCost: v.number(),
    taxTotal: v.number(),
    discountTotal: v.optional(v.number()),
    total: v.number(),
    shippingAddress: v.object({
      name: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
      phone: v.optional(v.string()),
    }),
    paymentMethod: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate a unique order identifier (e.g., ORD-1717000000000-42)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return await ctx.db.insert("orders", {
      userId,
      checkoutSessionId: args.checkoutSessionId,
      orderNumber,
      items: args.items,
      subtotal: args.subtotal,
      shippingCost: args.shippingCost,
      taxTotal: args.taxTotal,
      discountTotal: args.discountTotal,
      total: args.total,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: args.paymentMethod,
      stripePaymentIntentId: args.stripePaymentIntentId,
      shippingAddress: args.shippingAddress,
      createdAt: Date.now(),
    });
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const adminUser = await ctx.db.get(userId);
    if (!adminUser || adminUser.role !== "admin") return null;
    
    const orders = await ctx.db.query("orders").order("desc").collect();

    // Fetch the user for each order to append the email address
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await ctx.db.get(order.userId);
        return {
          ...order,
          customerEmail: user?.email || "No email on file", // Adjust 'email' if your users table uses a different key
        };
      })
    );

    return enrichedOrders;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentStatus: v.optional(
      v.union(
        v.literal("unpaid"),
        v.literal("paid"),
        v.literal("refunded"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    const patchData: {
      status: typeof args.status;
      paymentStatus?: typeof args.paymentStatus;
    } = { status: args.status };

    if (args.paymentStatus) {
      patchData.paymentStatus = args.paymentStatus;
    }

    return await ctx.db.patch(args.id, patchData);
  },
});

export const removeOrder = mutation({
  args: {
    id: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // 1. Check if the user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // 2. Check if the user is an admin
    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Not authorized");

    // 3. Verify the order exists before trying to delete it
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    // 4. Delete the order
    await ctx.db.delete(args.id);
  },
});