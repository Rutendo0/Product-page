import { useState } from "react";
import { type Product } from "@shared/schema";
import ProductCard from "./ProductCard";
import ProductListItem from "./ProductListItem";
import { FaThLarge, FaList } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define sort option type for better type safety
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  totalProducts: number;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSortChange: (sortOption: SortOption) => void;
  onRetry: () => void;
  onResetFilters: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  error,
  totalProducts,
  onProductClick,
  onAddToCart,
  onSortChange,
  onRetry,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState<SortOption>("featured");

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  const renderSkeleton = () => {
    return Array(6).fill(0).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
        <div className="h-48 bg-neutral"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-neutral rounded w-3/4"></div>
          <div className="h-6 bg-neutral rounded w-1/2"></div>
          <div className="h-4 bg-neutral rounded w-full"></div>
          <div className="h-4 bg-neutral rounded w-full"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-8 bg-neutral rounded w-1/3"></div>
            <div className="h-8 bg-neutral rounded w-8"></div>
          </div>
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error.message || 'Failed to load products. Please try again later.'}</span>
        <button onClick={onRetry} className="mt-3 bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Sorting and display options */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-neutral-dark">
              Showing <span>{products.length}</span> of <span>{totalProducts}</span> products
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label htmlFor="sort-products" className="mr-2 text-sm">Sort by:</label>
              <Select
                value={sortOption}
                onValueChange={(value: SortOption) => {
                  console.log("Sort changed to:", value);
                  setSortOption(value);
                  onSortChange(value);
                }}
              >
                <SelectTrigger id="sort-products" className="w-[180px]">
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <button 
                className={`${viewMode === 'grid' ? 'text-secondary' : 'text-gray-500 hover:text-secondary'}`}
                onClick={() => handleViewChange('grid')}
                aria-label="Grid view"
              >
                <FaThLarge />
              </button>
              <button 
                className={`${viewMode === 'list' ? 'text-secondary' : 'text-gray-500 hover:text-secondary'}`}
                onClick={() => handleViewChange('list')}
                aria-label="List view"
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeleton()}
        </div>
      )}

      {/* No results state */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="text-5xl text-neutral-dark mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-neutral-dark mb-4">Try adjusting your filters or search criteria</p>
          <button 
            onClick={onResetFilters}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold py-2 px-6 rounded-full"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Products grid (default view) */}
      {!isLoading && products.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.productId}
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {/* Products list (alternative view) */}
      {!isLoading && products.length > 0 && viewMode === 'list' && (
        <div className="space-y-6">
          {products.map(product => (
            <ProductListItem
              key={product.productId}
              product={product}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
