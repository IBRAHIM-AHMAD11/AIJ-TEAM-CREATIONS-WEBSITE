"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Doc } from "../../../../convex/_generated/dataModel";

interface RecentlyViewedProps {
  products: Doc<"products">[];
}

export default function RecentlyViewed({ products }: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="border-t border-slate-200 mt-8 pt-8 pb-12 px-4"
    >
      <h2 className="text-lg font-bold text-slate-800 mb-4">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.slice(0, 8).map((product) => (
          <Link
            key={product._id}
            href={`/products/${product.slug}`}
            className="group shrink-0 w-36"
          >
            <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative mb-2">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="144px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
            </div>
            <p className="text-xs font-medium text-slate-700 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {product.title}
            </p>
            <p className="text-xs text-slate-500">
              ${(product.price / 100).toFixed(2)}
            </p>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
