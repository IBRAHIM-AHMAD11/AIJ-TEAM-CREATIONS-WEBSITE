import { Doc } from "../../../../convex/_generated/dataModel"
import { useAtomValue } from "jotai";
import Link from "next/link";
import { selectedCategoriesAtom, stockOnlyAtom } from "./atoms";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Doc<"products">[] | undefined;
  isLoading: boolean;
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  const selectedCategories = useAtomValue(selectedCategoriesAtom);
  const stockOnly = useAtomValue(stockOnlyAtom);

  const allProducts = products ?? [];

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.categoryId);

    const matchesStock = !stockOnly || product.inventoryCount > 0;

    return matchesCategory && matchesStock;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg" />
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="text-gray-500">Try adjusting your filters or search options.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div 
            key={product._id} 
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
          >
            {/* Semantic Navigation Wrap: Clicking the upper part navigates to detail page */}
            <Link href={`/products/${product.slug}`} className="group block flex-1">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                <img
                  src={product.images?.[0] || "/placeholder-image.jpg"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </Link>

            {/* Price & Action (Kept outside the Link tag to avoid event bubbling) */}
            <div className="p-4 pt-0 flex items-center justify-between mt-auto">
              <span className="text-xl font-bold text-gray-900">
                ${(product.price / 100).toFixed(2)}
              </span>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                onClick={() => console.log(`Added ${product._id} to cart`)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}