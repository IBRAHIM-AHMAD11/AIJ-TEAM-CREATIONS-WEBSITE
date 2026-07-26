import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    
    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      ...user,
      role: user.role ?? "customer", 
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const patch: Record<string, string> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.image !== undefined) patch.image = args.image;
    await ctx.db.patch(userId, patch);
  },
});