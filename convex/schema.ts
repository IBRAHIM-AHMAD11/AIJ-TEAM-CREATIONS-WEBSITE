import { defineSchema, defineTable } from "convex/server";
import { authTables} from "@convex-dev/auth/server"
import { v } from "convex/values";

const schema = defineSchema({
   ...authTables,
   products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(), // Store as cents (e.g., $10.00 = 1000) to avoid float math errors
    inventoryCount: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()), // Array of image URLs
    isActive: v.boolean(), // Soft delete/hide products without wiping order history
    createdAt: v.number(),
    video: v.optional(v.string()), // Optional video URL
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["isActive"]),
});

export default schema;