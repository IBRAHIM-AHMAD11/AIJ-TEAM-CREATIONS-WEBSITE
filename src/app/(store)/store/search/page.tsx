"use client"

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePaginatedQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import ProductGrid from "@/app/(store)/store/productGrid";
import Breadcrumbs from "@/components/ui/breadcrumbs";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  const { results, status, loadMore } = usePaginatedQuery(
    api.products.getPaginated,
    {},
    { initialNumItems: 12 }
  );

  return (
    <div className="px-4 pt-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Store", href: "/store" },
          { label: `Search: "${q}"` },
        ]}
      />
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Search Results</h1>
        {q && (
          <p className="text-sm text-gray-500 mt-1">
            Showing results for &ldquo;{q}&rdquo;
          </p>
        )}
      </div>
      <ProductGrid
        products={results}
        isLoading={status === "LoadingFirstPage"}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status !== "Exhausted"}
        onLoadMore={() => loadMore(12)}
        searchQuery={q}
      />
    </div>
  );
}

const SearchPage = () => {
  return (
    <Suspense fallback={<div className="px-4 pt-4"><div className="animate-pulse bg-gray-200 h-8 w-64 rounded mb-4" /><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">{[...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg" />)}</div></div>}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage;
