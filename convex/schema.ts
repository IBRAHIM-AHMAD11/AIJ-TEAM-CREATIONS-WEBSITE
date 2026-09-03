import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // 1. Extended Convex Auth users table
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
    stripeCustomerId: v.optional(v.string()),
  }).index("email", ["email"]),

  // 2. Core products table definition
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
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_status", ["isActive"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    isDeleting: v.optional(v.boolean()),
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

  // 3. Checkout Sessions (For active purchase flows before final order creation)
  checkoutSessions: defineTable({
    userId: v.id("users"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        title: v.string(),
        unitPrice: v.number(),
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
    shippingAddressId: v.optional(v.id("addresses")),
    promoCodeId: v.optional(v.id("promoCodes")),
    subtotal: v.number(),
    discountTotal: v.number(),
    shippingCost: v.number(),
    taxTotal: v.number(),
    grandTotal: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("expired")
    ),
    stripePaymentIntentId: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // 4. Enhanced Orders Table
  orders: defineTable({
    userId: v.id("users"),
    checkoutSessionId: v.optional(v.id("checkoutSessions")),
    orderNumber: v.string(), // e.g., "ORD-10024"
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
    // Detailed cost breakdown
    subtotal: v.number(),
    discountTotal: v.optional(v.number()),
    shippingCost: v.number(),
    taxTotal: v.number(),
    total: v.number(),

    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    paymentStatus: v.union(
      v.literal("unpaid"),
      v.literal("paid"),
      v.literal("refunded"),
      v.literal("failed")
    ),
    paymentMethod: v.optional(v.string()), // e.g., "card", "paypal"
    stripePaymentIntentId: v.optional(v.string()),

    shippingAddress: v.object({
      name: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
      country: v.string(),
      phone: v.optional(v.string()),
    }),
    trackingNumber: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_payment_intent", ["stripePaymentIntentId"]),

  // 5. Promotional & Discount Codes
  promoCodes: defineTable({
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(), // e.g., 15 for 15% off, or 1000 for $10 off (in cents)
    minOrderValue: v.optional(v.number()),
    isActive: v.boolean(),
    expiresAt: v.optional(v.number()),
  }).index("by_code", ["code"]),

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