// convex/utils.ts (or inside your products.ts file)
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { ConvexError } from "convex/values";

export async function checkAdminStatus(ctx: GenericMutationCtx<any> | GenericQueryCtx<any>) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated: Please log in.");
  }

  // Look up user by their verified Clerk/Auth token identifier
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();

  if (!user || user.role !== "admin") {
    throw new ConvexError("Unauthorized: Admin access required.");
  }

  return user;
}