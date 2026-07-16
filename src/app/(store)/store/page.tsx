"use client"

import ProductGrid from "@/app/(store)/store/productGrid";
import { useGetProducts } from "../../../../convex/use-get-products";

const Home = () => {

  const { data, isLoading } = useGetProducts();

  return (
    <div>
      <ProductGrid products={data} isLoading={isLoading} />
    </div>
  )
}

export default Home