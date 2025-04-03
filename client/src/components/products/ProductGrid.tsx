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
  onAddToCompare?: (product: Product) => void;  // Optional function to add product to comparison
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
  onAddToCompare,
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
      <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-neutral/10">
        <div className="h-52 bg-neutral-100 flex items-center justify-center">
          <svg className="w-16 h-16 text-neutral-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
          </svg>
        </div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-neutral-100 rounded-full w-3/4"></div>
          <div className="h-6 bg-neutral-100 rounded-full w-1/2"></div>
          <div className="flex space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="w-4 h-4 bg-neutral-100 rounded-full"></div>
            ))}
          </div>
          <div className="h-4 bg-neutral-100 rounded-full w-full"></div>
          <div className="h-4 bg-neutral-100 rounded-full w-full"></div>
          <div className="flex justify-between items-center pt-2 border-t border-neutral-50">
            <div className="h-8 bg-neutral-100 rounded-full w-1/3"></div>
            <div className="h-8 bg-neutral-100 rounded-full w-8"></div>
          </div>
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-md p-6 mb-6" role="alert">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <svg className="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg text-red-700">Error Loading Products</p>
            <p className="text-gray-700 mt-1">{error.message || 'Failed to load products. Please try again later.'}</p>
            <div className="mt-4 flex space-x-3">
              <button 
                onClick={onRetry} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-150 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retry Loading
              </button>
              <button 
                onClick={onResetFilters} 
                className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg shadow-sm transition-colors duration-150"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sorting and display options */}
      <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-neutral/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="mr-3 text-primary bg-primary/5 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              </span>
              <div>
                <p className="text-neutral-dark font-medium">
                  Sort and View Options
                </p>
                <p className="text-sm text-neutral-dark/70">
                  Customize how you browse our catalog
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label htmlFor="sort-products" className="mr-2 text-sm font-medium">Sort by:</label>
              <Select
                value={sortOption}
                onValueChange={(value: SortOption) => {
                  setSortOption(value);
                  onSortChange(value);
                }}
              >
                <SelectTrigger id="sort-products" className="w-[180px] border border-neutral/20 shadow-sm">
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
            <div className="flex bg-neutral-100 p-1 rounded-lg border border-neutral-200">
              <button 
                className={`p-2 rounded transition-all ${viewMode === 'grid' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-neutral-500 hover:text-primary'}`}
                onClick={() => handleViewChange('grid')}
                aria-label="Grid view"
                title="Grid view"
              >
                <FaThLarge />
              </button>
              <button 
                className={`p-2 rounded transition-all ${viewMode === 'list' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-neutral-500 hover:text-primary'}`}
                onClick={() => handleViewChange('list')}
                aria-label="List view"
                title="List view"
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

      {/* No results state - improved with better visual design */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-neutral/5 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-5 p-6 bg-white rounded-full shadow-sm border border-neutral-100">
                <svg className="w-16 h-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-neutral-800">No products found</h3>
              <p className="text-neutral-600 mb-6 max-w-md">We couldn't find any products matching your current filters or search criteria. Try adjusting your parameters or reset all filters.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={onResetFilters}
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all hover:shadow flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Reset All Filters
                </button>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-medium py-3 px-6 rounded-lg shadow-sm"
                >
                  Try Different Search
                </button>
              </div>
            </div>
          </div>
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
              onAddToCompare={onAddToCompare}
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
              onAddToCompare={onAddToCompare}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
