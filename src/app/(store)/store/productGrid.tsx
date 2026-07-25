import { useEffect, useRef } from "react";
import { Doc } from "../../../../convex/_generated/dataModel"
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { selectedCategoriesAtom, stockOnlyAtom, sortByAtom, compareIdsAtom } from "./atoms";
import { cartOpenAtom } from "@/features/cart/store";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: Doc<"products">[] | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  onLoadMore: () => void;
  searchQuery?: string;
}



export default function ProductGrid({ products, isLoading, isLoadingMore, canLoadMore, onLoadMore, searchQuery: searchQueryProp }: ProductGridProps) {
  const selectedCategories = useAtomValue(selectedCategoriesAtom);
  const stockOnly = useAtomValue(stockOnlyAtom);
  const sortBy = useAtomValue(sortByAtom);
  const [compareIds, setCompareIds] = useAtom(compareIdsAtom);
  const addToCart = useMutation(api.cart.addItem);
  const setCartOpen = useSetAtom(cartOpenAtom);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allProducts = products ?? [];
  const q = (searchQueryProp ?? "").toLowerCase().trim();

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && canLoadMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, isLoadingMore, onLoadMore]);

  const filteredProducts = allProducts
    .filter((product) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.categoryId);
      const matchesStock = !stockOnly || product.inventoryCount > 0;
      const matchesSearch = !q || product.title.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
      return matchesCategory && matchesStock && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "newest":
          return (b.createdAt ?? 0) - (a.createdAt ?? 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="animate-pulse bg-gray-200 h-80 rounded-lg" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search options.</p>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold mb-6 text-gray-800"
      >
        Our Products
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            layout
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white flex flex-col justify-between"
          >
            <Link href={`/products/${product.slug}`} className="group block flex-1">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="size-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product._id); }}
                  className={`absolute top-2 right-2 size-6 rounded-full border-2 flex items-center justify-center transition-colors z-10 ${
                    compareIds.includes(product._id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white/80 border-slate-300 hover:border-blue-400"
                  }`}
                  aria-label={compareIds.includes(product._id) ? "Remove from compare" : "Add to compare"}
                >
                  <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </Link>
            <div className="p-4 pt-0 flex items-center justify-between mt-auto">
              <span className="text-xl font-bold text-gray-900">
                {product.features && product.features.length > 0 ? "From $" : "$"}{(product.price / 100).toFixed(2)}
              </span>
              {product.features && product.features.length > 0 ? (
                <Link href={`/products/${product.slug}`}>
                  <Button className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded text-sm font-medium transition-colors">
                    Select Options
                  </Button>
                </Link>
              ) : (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  onClick={() => {
                    addToCart({ productId: product._id, quantity: 1 });
                    setCartOpen(true);
                  }}
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <Spinner className="size-6 text-slate-400" />
        </div>
      )}

      {canLoadMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
}