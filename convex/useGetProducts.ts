import { useQuery } from "convex/react";
import { api } from "./_generated/api";

export const useGetProducts = () => {
   const data = useQuery(api.products.get);
   const isLoading = data === undefined;

   return { data, isLoading };
};