"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryProductsDialogProps {
  category: { id: Id<"categories">; name: string } | null;
  onClose: () => void;
}

export function CategoryProductsDialog({ category, onClose }: CategoryProductsDialogProps) {
  const allProducts = useQuery(api.products.list);

  // Filter products for the selected category
  const categoryProducts = allProducts?.filter(
    (product) => product.categoryId === category?.id
  );

  return (
    <Dialog open={!!category} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[550px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-600" />
            Products in "{category?.name}"
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 mt-2">
          {allProducts === undefined && (
            <p className="text-sm text-slate-500 py-4 text-center">Loading products...</p>
          )}

          {categoryProducts && categoryProducts.length === 0 && (
            <div className="py-8 text-center border rounded-lg bg-slate-50">
              <p className="text-sm text-slate-500">No products assigned to this category.</p>
            </div>
          )}

          {categoryProducts && categoryProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.images?.[0] ? (
                  <div className="relative w-10 h-10 rounded border overflow-hidden bg-white shrink-0">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded border bg-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{product.title}</h4>
                  <p className="text-xs text-slate-500">
                    ${(product.price / 100).toFixed(2)} • Stock: {product.inventoryCount}
                  </p>
                </div>
              </div>

              <Link
                href={`/admin/products?search=${encodeURIComponent(product.title)}`}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded transition-colors"
                title="View in Products Admin"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}