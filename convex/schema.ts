import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // 1. Explicitly extend the injected Convex Auth users table
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    
    // Custom e-commerce configuration:
    role: v.optional(v.union(v.literal("customer"), v.literal("admin"))),
  }).index("email", ["email"]),

  // 2. Your core products table definition
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(), 
    inventoryCount: v.number(),
    categoryId: v.id("categories"),
    images: v.array(v.string()), 
    isActive: v.boolean(), 
    createdAt: v.number(),
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
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["isActive"]),
  
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  addresses: defineTable({
    userId: v.id("users"),
    name: v.string(),
    street: v.string(),
    city: v.string(),
    state: v.string(),
    zip: v.string(),
    country: v.string(),
    isDefault: v.boolean(),
  }).index("by_user", ["userId"]),

  orders: defineTable({
    userId: v.id("users"),
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
    total: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    shippingAddress: v.object({
      name: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
    }),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  cartItems: defineTable({
    userId: v.id("users"),
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
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"]),
});

export default schema;