"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Doc } from "../../../../convex/_generated/dataModel";

interface RelatedProductsProps {
  products: Doc<"products">[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="max-w-7xl mx-auto px-4 md:px-8 pb-12"
    >
      <h2 className="text-xl font-bold text-foreground mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/products/${product.slug}`}
            className="group border border-border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-muted relative">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-blue-600 transition-colors">
                {product.title}
              </p>
              <p className="text-sm font-semibold text-foreground mt-1">
                ${(product.price / 100).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
