import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Product, type ProductFilter } from "@shared/schema";
import ProductFilter from "@/components/products/ProductFilter";
import ProductGrid from "@/components/products/ProductGrid";
import ProductPagination from "@/components/products/ProductPagination";
import ProductModal from "@/components/products/ProductModal";

const PRODUCTS_PER_PAGE = 9;

const Products = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilter>({});
  
  // Generate query key based on filters and pagination
  const queryKey = [
    '/api/products',
    filters.categories?.join(',') ?? '',
    filters.brands?.join(',') ?? '',
    filters.minPrice ?? '',
    filters.maxPrice ?? '',
    filters.sort ?? '',
    currentPage,
    PRODUCTS_PER_PAGE
  ];
  
  // Query to get products
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey,
    keepPreviousData: true,
    staleTime: 60000, // 1 minute
  });
  
  // Get the total number of products (without pagination)
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !isLoading && products.length > 0,
    staleTime: 60000, // 1 minute
  });
  
  // Calculate the total pages
  const totalPages = Math.ceil(
    // Apply filters but ignore pagination
    allProducts.filter(product => {
      if (filters.categories?.length && product.category && !filters.categories.includes(product.category)) {
        return false;
      }
      if (filters.brands?.length && product.brand && !filters.brands.includes(product.brand)) {
        return false;
      }
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }
      return true;
    }).length / PRODUCTS_PER_PAGE
  );
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.categories, filters.brands, filters.minPrice, filters.maxPrice]);
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartCount(prev => prev + quantity);
  };
  
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  const handleSortChange = (sortOption: string) => {
    setFilters(prev => ({
      ...prev,
      sort: sortOption as any
    }));
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };
  
  const handleRetry = () => {
    refetch();
  };
  
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Page title section */}
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Car Parts Catalog</h1>
          <p className="mt-2 text-neutral-light">Quality automotive parts for all your needs</p>
          <div className="flex flex-wrap mt-4 gap-2">
            <span className="bg-primary-light px-3 py-1 rounded-full text-sm">Original Equipment</span>
            <span className="bg-primary-light px-3 py-1 rounded-full text-sm">Aftermarket</span>
            <span className="bg-primary-light px-3 py-1 rounded-full text-sm">Performance Parts</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters */}
          <aside className="lg:w-1/4">
            <ProductFilter 
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Products section */}
          <div className="lg:w-3/4">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              error={error as Error}
              totalProducts={allProducts.length}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onSortChange={handleSortChange}
              onRetry={handleRetry}
              onResetFilters={handleResetFilters}
            />

            {!isLoading && !error && products.length > 0 && (
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Products;
