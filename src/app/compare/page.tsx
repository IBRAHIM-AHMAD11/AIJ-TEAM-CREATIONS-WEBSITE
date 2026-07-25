"use client";

import { useAtom } from "jotai";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { compareIdsAtom } from "../(store)/store/atoms";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ComparePage() {
  const [compareIds] = useAtom(compareIdsAtom);
  const products = useQuery(
    api.products.getByIds,
    compareIds.length > 0 ? { ids: compareIds as Id<"products">[] } : "skip"
  );

  if (!products || products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">No products to compare</h1>
          <p className="text-slate-500">
            <Link href="/store" className="text-blue-600 hover:underline">Browse products</Link> and add them to compare.
          </p>
        </div>
      </div>
    );
  }

  const allFeatures = Array.from(
    new Set(products.flatMap((p) => (p.features ?? []).map((f) => `${f.type}:${f.label}`)))
  );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Store", href: "/store" }, { label: "Compare" }]} />

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-slate-800 mb-8"
      >
        Compare Products
      </motion.h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-sm font-semibold text-slate-500 p-3 w-32" />
              {products.map((p) => (
                <th key={p._id} className="p-3 min-w-[200px]">
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative mb-3">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.title} fill className="object-cover" sizes="200px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <svg className="size-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  <Link href={`/products/${p.slug}`} className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
                    {p.title}
                  </Link>
                  <p className="text-lg font-bold text-slate-900 mt-1">${(p.price / 100).toFixed(2)}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="text-sm font-semibold text-slate-500 p-3">Description</td>
              {products.map((p) => (
                <td key={p._id} className="text-sm text-slate-600 p-3">{p.description}</td>
              ))}
            </tr>
            <tr className="border-t border-slate-200">
              <td className="text-sm font-semibold text-slate-500 p-3">Stock</td>
              {products.map((p) => (
                <td key={p._id} className="text-sm p-3">
                  <span className={p.inventoryCount > 0 ? "text-green-600" : "text-red-500"}>
                    {p.inventoryCount > 0 ? `In Stock (${p.inventoryCount})` : "Out of Stock"}
                  </span>
                </td>
              ))}
            </tr>
            {allFeatures.map((featureKey) => {
              const [type, label] = featureKey.split(":");
              return (
                <tr key={featureKey} className="border-t border-slate-200">
                  <td className="text-sm font-semibold text-slate-500 p-3 capitalize">{label}</td>
                  {products.map((p) => {
                    const f = (p.features ?? []).find((fe) => fe.type === type && fe.label === label);
                    return (
                      <td key={p._id} className="text-sm text-slate-600 p-3">
                        {f ? (
                          <span>
                            {f.value}
                            {f.priceAdjustment ? ` (${f.priceAdjustment > 0 ? "+" : ""}$${(f.priceAdjustment / 100).toFixed(2)})` : ""}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
