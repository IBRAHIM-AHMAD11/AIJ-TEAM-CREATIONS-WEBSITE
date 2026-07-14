"use client"

import { UserButton } from "@/features/auth/components/user-avatar"

import { useGetProducts } from "@/features/store/api/use-get-products";
import ProductGrid from "@/features/store/page";

const Home = () => {

  const { data, isLoading } = useGetProducts();

  return (
    <div>
      <UserButton />
      <ProductGrid products={data} isLoading={isLoading} />
    </div>
  )
}

export default Home