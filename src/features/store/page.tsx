import { Doc } from "../../../convex/_generated/dataModel"

// 1. Define the props interface using Convex's document generator type
interface ProductGridProps {
  products: Doc<"products">[] | undefined;
  isLoading: boolean;
}

// 2. Accept the props directly in the component signature
export default function ProductGrid({ products, isLoading }: ProductGridProps) {

  // 3. Handle the loading state gracefully
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-80 rounded-lg" />
        ))}
      </div>
    );
  }

  // 4. Handle empty state if no products match the query
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
        <p className="text-gray-500">Check back later or add items via the dashboard.</p>
      </div>
    );
  }

  // 5. Render the product catalog
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product._id} 
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col justify-between"
          >
            <div>
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 relative">
                <img
                  src={product.images?.[0] || "/placeholder-image.jpg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Price & Action */}
            <div className="p-4 pt-0 flex items-center justify-between mt-auto">
              <span className="text-xl font-bold text-gray-900">
                ${(product.price / 100).toFixed(2)}
              </span>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                onClick={() => console.log(`Added ${product._id} to cart`)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}