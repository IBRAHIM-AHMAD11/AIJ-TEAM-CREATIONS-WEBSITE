import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useMemo } from "react";

export const useGetProducts = () => {
   const data = useQuery(api.products.get);
   const isLoading = data === undefined;

   // FIXED: Safely access the first item only if the array exists and has elements
   const productId = useMemo(() => {
      if (!data || data.length === 0) return undefined;
      return data[0]._id;
   }, [data]);

   useEffect(() => {
      if (isLoading) return;
      if (productId) {
         console.log("Product ID:", productId);
      } else {
         console.log("No products found.");
      }
   }, [productId, isLoading]);

   return { data, isLoading };
};