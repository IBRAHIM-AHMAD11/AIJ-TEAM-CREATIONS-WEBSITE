"use client"

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import ProductGrid from "@/app/(store)/store/productGrid";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import RecentlyViewed from "./recentlyViewed";

const Home = () => {

  const { results, status, loadMore } = usePaginatedQuery(
    api.products.getPaginated,
    {},
    { initialNumItems: 12 }
  );

  const { recentlyViewedIds } = useRecentlyViewed();
  const recentlyViewedProducts = useQuery(
    api.products.getByIds,
    recentlyViewedIds.length > 0 ? { ids: recentlyViewedIds as Id<"products">[] } : "skip"
  );

  return (
    <div className="px-4 pt-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Store" }]} />
      <ProductGrid
        products={results}
        isLoading={status === "LoadingFirstPage"}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status !== "Exhausted"}
        onLoadMore={() => loadMore(12)}
      />
      <RecentlyViewed products={recentlyViewedProducts ?? []} />
    </div>
  )
}

export default Home