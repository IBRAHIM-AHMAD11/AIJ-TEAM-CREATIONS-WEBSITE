import { internalMutation, internalQuery } from "./_generated/server";

export const convertProductFeatures = internalMutation({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    let converted = 0;

    for (const product of products) {
      if (!product.features || product.features.length === 0) continue;

      let changed = false;
      const newFeatures = product.features.map((f: any) => {
        if ("featureType" in f) {
          changed = true;
          return { type: "color" as const, label: f.featureType, value: f.color };
        }
        return f;
      });

      if (changed) {
        await ctx.db.patch(product._id, { features: newFeatures });
        converted++;
      }
    }

    return { converted };
  },
});

export const verifyMigration = internalQuery({
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const unmigrated = products.filter(
      (p) => p.features && p.features.some((f: any) => "featureType" in f)
    );
    return {
      complete: unmigrated.length === 0,
      totalProducts: products.length,
      remainingCount: unmigrated.length,
      sampleIds: unmigrated.map((p) => p._id),
    };
  },
});
