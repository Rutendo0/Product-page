import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type Product, type ProductFilter } from "@shared/schema";
import ProductFilterComponent from "@/components/products/ProductFilter";
import ProductGrid from "@/components/products/ProductGrid";
import ProductPagination from "@/components/products/ProductPagination";
import ProductModal from "@/components/products/ProductModal";
import ProductCompare from "@/components/products/ProductCompare";
import { FaSearch, FaShoppingCart, FaExchangeAlt } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { Link } from "wouter";

// Import the SortOption type from ProductGrid
type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'name-asc'
  | 'name-desc'
  | 'newest'
  | 'popularity'
  | 'rating-desc';

const PRODUCTS_PER_PAGE = 9;

const Products = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { addToCart, count: cartCount } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductInCompare, setIsProductInCompare] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Product comparison state
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  // Track selected filters for displaying badges
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Calculate compare count
  const compareCount = compareProducts.length;
  
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
    const isInCompare = compareProducts.some(p => p.productId === product.productId);
    setIsProductInCompare(isInCompare);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addToCart(product, quantity);
  };
  
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilter>) => {
    setFilters(prev => {
      const updatedFilters = {
        ...prev,
        ...newFilters
      };
      
      // Update selected categories and brands for badge display
      if (newFilters.categories !== undefined) {
        setSelectedCategories(newFilters.categories || []);
      }
      
      if (newFilters.brands !== undefined) {
        setSelectedBrands(newFilters.brands || []);
      }
      
      return updatedFilters;
    });
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
    setSelectedCategories([]);
    setSelectedBrands([]);
  };
  
  const handleRetry = () => {
    refetch();
  };
  
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  // Product comparison methods
  const handleAddToCompare = (product: Product) => {
    setCompareProducts(prev => {
      // Check if product is already in compare list
      const isAlreadyInCompare = prev.some(p => p.productId === product.productId);
      
      if (isAlreadyInCompare) {
        toast({
          title: "Already in comparison",
          description: "This product is already in your comparison list.",
          duration: 3000,
        });
        return prev;
      }
      
      // Check if we've reached the maximum number of items to compare (4)
      if (prev.length >= 4) {
        toast({
          title: "Comparison limit reached",
          description: "You can compare up to 4 products at a time. Remove a product to add another.",
          duration: 4000,
        });
        return prev;
      }
      
      toast({
        title: "Added to comparison",
        description: `${product.name} added to comparison list.`,
        duration: 3000,
      });
      
      return [...prev, product];
    });
  };
  
  const handleRemoveFromCompare = (productId: string) => {
    setCompareProducts(prev => prev.filter(p => p.productId !== productId));
    
    toast({
      title: "Removed from comparison",
      description: "Product removed from comparison list.",
      duration: 3000,
    });
  };
  
  const openCompareModal = () => {
    if (compareProducts.length === 0) {
      toast({
        title: "No products to compare",
        description: "Add products to your comparison list first.",
        duration: 3000,
      });
      return;
    }
    
    setIsCompareModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-green-950/95">
      {/* Page title section with gradient background */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Car Parts Marketplace</h1>
              <p className="mt-3 text-lg text-white/90 max-w-xl">Shop OEM and aftermarket car parts by make, model, and year. Compare prices and suppliers to get the best deal.</p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              {/* Compare button with counter and animation */}
              <button 
                onClick={openCompareModal}
                className="relative bg-card hover:bg-accent text-primary p-3 rounded-full shadow-md transition-all hover:shadow-lg hover:scale-105"
              >
                <FaExchangeAlt size={20} />
                {compareCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center shadow-sm">
                    {compareCount}
                  </Badge>
                )}
              </button>
              
              {/* Shopping cart button with counter and animation */}
              <Link href="/cart" className="relative bg-card hover:bg-accent text-primary p-3 rounded-full shadow-md transition-all hover:shadow-lg hover:scale-105">
                <FaShoppingCart size={22} />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center shadow-sm">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </div>
          </div>
          
          {/* Enhanced search bar with shadow and better styling */}
          <div className="mt-6 relative max-w-3xl mx-auto">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for parts by name, brand, category..."
                className="w-full px-4 py-4 pl-12 rounded-l-lg border-0 focus:ring-2 focus:ring-primary focus:outline-none text-neutral-800"
              />
              <button 
                onClick={handleResetFilters}
                className="bg-card text-primary font-medium px-6 py-4 hover:bg-accent transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => console.log("Search triggered")}
                className="bg-card text-primary font-medium px-6 py-4 rounded-r-lg hover:bg-accent transition-colors"
              >
                Search
              </button>
            </div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-neutral-400">
              <FaSearch size={16} />
            </div>
          </div>
          
          {/* Popular categories */}
          <div className="flex flex-wrap mt-6 gap-2 justify-center">
            <span className="bg-secondary/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary/50 cursor-pointer transition-colors">Original Equipment</span>
            <span className="bg-secondary/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary/50 cursor-pointer transition-colors">Aftermarket</span>
            <span className="bg-secondary/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary/50 cursor-pointer transition-colors">Performance Parts</span>
            <span className="bg-secondary/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-secondary/50 cursor-pointer transition-colors">Special Offers</span>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-10 -mt-6">
        {/* Mobile filter toggle - improved styling */}
        <div className="lg:hidden mb-6">
          <button
            onClick={toggleMobileFilters}
            className="w-full bg-card text-primary font-semibold py-4 px-5 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border flex justify-between items-center"
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filters & Options
            </span>
            <svg className={`w-5 h-5 transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar with filters - improved with animation */}
          <aside className={`lg:w-1/4 transition-all duration-300 transform ${showMobileFilters ? 'opacity-100 scale-100' : 'opacity-0 scale-95 lg:opacity-100 lg:scale-100'} ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-4">
              <ProductFilterComponent 
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
          </aside>

          {/* Products section */}
          <div className="lg:w-3/4">
            {/* Results count and alert message - improved styling */}
            {!isLoading && (
              <div className="bg-card rounded-xl shadow-md p-5 mb-6 border border-border">
                <div className="flex flex-wrap justify-between items-center">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-primary">{filteredProducts.length}</span> of <span className="font-semibold text-primary">{totalFilteredProducts}</span> products
                  </p>
                  
                  {(selectedBrands.length > 0 || selectedCategories.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-2 lg:mt-0">
                      {selectedCategories.map((cat: string) => (
                        <Badge key={cat} className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer px-3 py-1">
                          {cat} ×
                        </Badge>
                      ))}
                      {selectedBrands.map((brand: string) => (
                        <Badge key={brand} className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer px-3 py-1">
                          {brand} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {searchQuery && (
                  <div className="mt-3 text-sm bg-accent text-foreground p-3 rounded-lg border border-border">
                    <span className="font-medium">Search results for:</span> <span className="font-semibold">"{searchQuery}"</span>
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
              onAddToCompare={handleAddToCompare}
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
        onAddToCompare={handleAddToCompare}
        onRemoveFromCompare={handleRemoveFromCompare}
        isInCompare={isProductInCompare}
      />
      
      {/* Product Comparison Modal */}
      <ProductCompare
        products={compareProducts}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveProduct={handleRemoveFromCompare}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Products;
