import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Product, type ProductFilter } from "@shared/schema";
import ProductFilterComponent from "@/components/products/ProductFilter";
import ProductGrid from "@/components/products/ProductGrid";
import ProductPagination from "@/components/products/ProductPagination";
import ProductModal from "@/components/products/ProductModal";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";

// Import the SortOption type from ProductGrid
type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const PRODUCTS_PER_PAGE = 9;

const Products = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<{product: Product, quantity: number}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Calculate cart count
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  // Generate query key based on filters and pagination
  const queryKey = [
    '/api/products',
    {
      categories: filters.categories,
      brands: filters.brands,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: currentPage,
      limit: PRODUCTS_PER_PAGE
    }
  ];
  
  // Query to get products
  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey,
    placeholderData: (previousData) => previousData,  // similar to keepPreviousData in v4
    staleTime: 60000, // 1 minute
  });
  
  // Get the total number of products (without pagination)
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !isLoading && products.length > 0,
    staleTime: 60000, // 1 minute
  });
  
  // Filter products by search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) || 
      (product.description && product.description.toLowerCase().includes(query)) ||
      (product.brand && product.brand.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
    );
  });
  
  // Calculate the total pages for filtered products
  const totalFilteredProducts = allProducts.filter(product => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(query);
      const descMatch = product.description && product.description.toLowerCase().includes(query);
      const brandMatch = product.brand && product.brand.toLowerCase().includes(query);
      const categoryMatch = product.category && product.category.toLowerCase().includes(query);
      
      if (!(nameMatch || descMatch || brandMatch || categoryMatch)) {
        return false;
      }
    }
    
    // Apply category filter
    if (filters.categories?.length && product.category && !filters.categories.includes(product.category)) {
      return false;
    }
    
    // Apply brand filter
    if (filters.brands?.length && product.brand && !filters.brands.includes(product.brand)) {
      return false;
    }
    
    // Apply price filter
    if (filters.minPrice !== undefined && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
      return false;
    }
    
    return true;
  }).length;
  
  const totalPages = Math.ceil(totalFilteredProducts / PRODUCTS_PER_PAGE);
  
  // Reset to first page when filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.categories, filters.brands, filters.minPrice, filters.maxPrice, searchQuery]);
  
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      // Check if product already exists in cart
      const existingItem = prev.find(item => item.product.productId === product.productId);
      
      if (existingItem) {
        // Update quantity if product already exists
        return prev.map(item => 
          item.product.productId === product.productId 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        // Add new product if it doesn't exist
        return [...prev, { product, quantity }];
      }
    });
  };
  
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  const handleSortChange = (sortOption: SortOption) => {
    console.log("Products.tsx received sort change:", sortOption);
    setFilters(prev => {
      const newFilters = {
        ...prev,
        sort: sortOption
      };
      console.log("New filters after sort:", newFilters);
      return newFilters;
    });
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery("");
    setCurrentPage(1);
  };
  
  const handleRetry = () => {
    refetch();
  };
  
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Page title section */}
      <section className="bg-primary text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Car Parts Catalog</h1>
              <p className="mt-2 text-neutral-light">Quality automotive parts for all your needs</p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {/* Shopping cart button with counter */}
              <button className="relative bg-secondary/90 hover:bg-secondary text-white p-3 rounded-full">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="mt-6 relative">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for parts by name, description, brand..."
                className="w-full px-4 py-3 pl-12 rounded-l-lg border-0 focus:ring-2 focus:ring-secondary"
              />
              <button 
                onClick={handleResetFilters}
                className="bg-secondary text-white px-4 py-3 rounded-r-lg hover:bg-secondary/90"
              >
                Reset
              </button>
            </div>
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex flex-wrap mt-4 gap-2">
            <span className="bg-primary-light px-3 py-1 rounded-full text-sm">Original Equipment</span>
            <span className="bg-primary-light px-3 py-1 rounded-full text-sm">Aftermarket</span>
            <span className="bg-primary-light px-3 py-1 rounded-full text-sm">Performance Parts</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={toggleMobileFilters}
            className="w-full bg-white text-primary font-semibold py-3 px-4 rounded-lg shadow border border-neutral flex justify-between items-center"
          >
            <span>Filters & Options</span>
            <svg className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters - conditionally shown on mobile */}
          <aside className={`lg:w-1/4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <ProductFilterComponent 
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
            />
          </aside>

          {/* Products section */}
          <div className="lg:w-3/4">
            {/* Results count and alert message */}
            {!isLoading && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <p className="text-neutral-dark">
                  Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{totalFilteredProducts}</span> products
                </p>
                {searchQuery && (
                  <div className="mt-2 text-sm bg-blue-50 text-blue-800 p-2 rounded">
                    Search results for: <span className="font-semibold">"{searchQuery}"</span>
                  </div>
                )}
              </div>
            )}
            
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              error={error as Error}
              totalProducts={totalFilteredProducts}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onSortChange={handleSortChange}
              onRetry={handleRetry}
              onResetFilters={handleResetFilters}
            />

            {!isLoading && !error && filteredProducts.length > 0 && (
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
