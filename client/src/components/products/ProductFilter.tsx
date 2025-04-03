import { useState, useEffect } from "react";
import { FaChevronDown, FaSearch, FaFilter, FaTimes, FaCheck } from "react-icons/fa";
import PriceSlider from "@/components/ui/price-slider";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterProps {
  onFilterChange: (filters: {
    categories?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    compatibility?: { make?: string; model?: string; year?: string };
  }) => void;
  onResetFilters: () => void;
}

const ProductFilter: React.FC<FilterProps> = ({ onFilterChange, onResetFilters }) => {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [brandOpen, setBrandOpen] = useState(true);
  const [compatibilityOpen, setCompatibilityOpen] = useState(true);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 500 });
  const [compatibility, setCompatibility] = useState<{ make?: string; model?: string; year?: string }>({});
  
  // Search states
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  
  // Active filters count
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Queries
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['/api/categories'],
  });

  const { data: brands = [] } = useQuery<string[]>({
    queryKey: ['/api/brands'],
  });

  const { data: initialPriceRange } = useQuery<{ min: number; max: number }>({
    queryKey: ['/api/price-range'],
  });

  // Initialize price range from API
  useEffect(() => {
    if (initialPriceRange) {
      setPriceRange({
        min: Math.floor(initialPriceRange.min),
        max: Math.ceil(initialPriceRange.max)
      });
    }
  }, [initialPriceRange]);

  // Apply filters
  useEffect(() => {
    onFilterChange({
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      compatibility: Object.keys(compatibility).length > 0 ? compatibility : undefined
    });
    
    // Count active filters
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedBrands.length > 0) count++;
    
    // Check if price range is different from default
    if (initialPriceRange && 
        (priceRange.min !== Math.floor(initialPriceRange.min) || 
         priceRange.max !== Math.ceil(initialPriceRange.max))) {
      count++;
    }
    
    if (Object.keys(compatibility).length > 0) count++;
    setActiveFiltersCount(count);
    
  }, [selectedCategories, selectedBrands, priceRange, compatibility, initialPriceRange, onFilterChange]);

  // Filter categories based on search
  const filteredCategories = categories.filter(category => 
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Filter brands based on search
  const filteredBrands = brands.filter(brand => 
    brand.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    }
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleCompatibilityChange = (key: 'make' | 'model' | 'year', value: string) => {
    if (!value || value.trim() === ' ') {
      const newCompatibility = { ...compatibility };
      delete newCompatibility[key];
      setCompatibility(newCompatibility);
    } else {
      setCompatibility({ ...compatibility, [key]: value });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    if (initialPriceRange) {
      setPriceRange({
        min: Math.floor(initialPriceRange.min),
        max: Math.ceil(initialPriceRange.max)
      });
    } else {
      setPriceRange({ min: 0, max: 500 });
    }
    setCompatibility({});
    setCategorySearch("");
    setBrandSearch("");
    onResetFilters();
  };

  const resetCategoryFilter = () => {
    setSelectedCategories([]);
    setCategorySearch("");
  };

  const resetBrandFilter = () => {
    setSelectedBrands([]);
    setBrandSearch("");
  };

  const resetPriceFilter = () => {
    if (initialPriceRange) {
      setPriceRange({
        min: Math.floor(initialPriceRange.min),
        max: Math.ceil(initialPriceRange.max)
      });
    }
  };

  const resetCompatibilityFilter = () => {
    setCompatibility({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FaFilter className="text-primary" /> 
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="bg-secondary text-white">{activeFiltersCount}</Badge>
          )}
        </h2>
        {activeFiltersCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearFilters} 
            className="text-sm text-secondary border-secondary hover:bg-secondary/10"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category filter */}
        <div className="border-b pb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            <div className="flex items-center gap-2">
              <span>Category</span>
              {selectedCategories.length > 0 && (
                <Badge variant="outline" className="bg-secondary/10 text-xs">
                  {selectedCategories.length}
                </Badge>
              )}
            </div>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {categoryOpen && (
            <div className="mt-3 space-y-3">
              {/* Category search */}
              <div className="relative">
                <Input
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="pl-8 text-sm"
                />
                <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                {categorySearch && (
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setCategorySearch("")}
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              
              {/* Category list */}
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category: string) => (
                    <div className="flex items-center space-x-2" key={category}>
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-2 text-center">
                    No categories found
                  </div>
                )}
              </div>
              
              {/* Selected count and clear button */}
              {selectedCategories.length > 0 && (
                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-gray-500">
                    {selectedCategories.length} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetCategoryFilter} className="h-6 px-2">
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price filter */}
        <div className="border-b pb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setPriceOpen(!priceOpen)}
          >
            <div className="flex items-center gap-2">
              <span>Price Range</span>
              {initialPriceRange && 
                (priceRange.min !== Math.floor(initialPriceRange.min) || 
                priceRange.max !== Math.ceil(initialPriceRange.max)) && (
                <Badge variant="outline" className="bg-secondary/10 text-xs">
                  1
                </Badge>
              )}
            </div>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${priceOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {priceOpen && (
            <div className="mt-3">
              <PriceSlider
                min={initialPriceRange?.min || 0}
                max={initialPriceRange?.max || 500}
                initialMin={priceRange.min}
                initialMax={priceRange.max}
                onChange={handlePriceChange}
              />
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">${priceRange.min}</span>
                <span className="text-sm font-medium">${priceRange.max}</span>
              </div>
              
              {/* Reset button for price */}
              {initialPriceRange && 
                (priceRange.min !== Math.floor(initialPriceRange.min) || 
                priceRange.max !== Math.ceil(initialPriceRange.max)) && (
                <div className="mt-2 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={resetPriceFilter} className="h-6 px-2 text-xs">
                    Reset
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand filter */}
        <div className="border-b pb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setBrandOpen(!brandOpen)}
          >
            <div className="flex items-center gap-2">
              <span>Brand</span>
              {selectedBrands.length > 0 && (
                <Badge variant="outline" className="bg-secondary/10 text-xs">
                  {selectedBrands.length}
                </Badge>
              )}
            </div>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {brandOpen && (
            <div className="mt-3 space-y-3">
              {/* Brand search */}
              <div className="relative">
                <Input
                  placeholder="Search brands..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="pl-8 text-sm"
                />
                <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                {brandSearch && (
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setBrandSearch("")}
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>
              
              {/* Brand list */}
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map((brand: string) => (
                    <div className="flex items-center space-x-2" key={brand}>
                      <Checkbox
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                      />
                      <Label htmlFor={`brand-${brand}`} className="text-sm font-normal cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-2 text-center">
                    No brands found
                  </div>
                )}
              </div>
              
              {/* Selected count and clear button */}
              {selectedBrands.length > 0 && (
                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-gray-500">
                    {selectedBrands.length} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetBrandFilter} className="h-6 px-2">
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compatibility filter */}
        <div>
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setCompatibilityOpen(!compatibilityOpen)}
          >
            <div className="flex items-center gap-2">
              <span>Vehicle Compatibility</span>
              {Object.keys(compatibility).length > 0 && (
                <Badge variant="outline" className="bg-secondary/10 text-xs">
                  {Object.keys(compatibility).length}
                </Badge>
              )}
            </div>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${compatibilityOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {compatibilityOpen && (
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="vehicle-make" className="text-xs mb-1 block text-gray-500">Make</Label>
                <Select
                  value={compatibility.make || ""}
                  onValueChange={(value) => handleCompatibilityChange('make', value)}
                >
                  <SelectTrigger id="vehicle-make" className="text-sm">
                    <SelectValue placeholder="Any Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Any Make</SelectItem>
                    <SelectItem value="toyota">Toyota</SelectItem>
                    <SelectItem value="honda">Honda</SelectItem>
                    <SelectItem value="ford">Ford</SelectItem>
                    <SelectItem value="bmw">BMW</SelectItem>
                    <SelectItem value="mercedes">Mercedes</SelectItem>
                  </SelectContent>
                </Select>
                {compatibility.make && (
                  <div className="mt-1 text-xs flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleCompatibilityChange('make', ' ')}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="vehicle-model" className="text-xs mb-1 block text-gray-500">Model</Label>
                <Select
                  value={compatibility.model || ""}
                  onValueChange={(value) => handleCompatibilityChange('model', value)}
                >
                  <SelectTrigger id="vehicle-model" className="text-sm">
                    <SelectValue placeholder="Any Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Any Model</SelectItem>
                    <SelectItem value="camry">Camry</SelectItem>
                    <SelectItem value="civic">Civic</SelectItem>
                    <SelectItem value="f150">F-150</SelectItem>
                    <SelectItem value="3series">3 Series</SelectItem>
                    <SelectItem value="cclass">C-Class</SelectItem>
                  </SelectContent>
                </Select>
                {compatibility.model && (
                  <div className="mt-1 text-xs flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleCompatibilityChange('model', ' ')}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="vehicle-year" className="text-xs mb-1 block text-gray-500">Year</Label>
                <Select
                  value={compatibility.year || ""}
                  onValueChange={(value) => handleCompatibilityChange('year', value)}
                >
                  <SelectTrigger id="vehicle-year" className="text-sm">
                    <SelectValue placeholder="Any Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Any Year</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2019">2019</SelectItem>
                    <SelectItem value="2018">2018</SelectItem>
                    <SelectItem value="2017">2017</SelectItem>
                    <SelectItem value="2016">2016</SelectItem>
                    <SelectItem value="2015">2015</SelectItem>
                  </SelectContent>
                </Select>
                {compatibility.year && (
                  <div className="mt-1 text-xs flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 px-1 text-gray-500 hover:text-gray-700"
                      onClick={() => handleCompatibilityChange('year', ' ')}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Reset compatibility button */}
              {Object.keys(compatibility).length > 0 && (
                <div className="pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetCompatibilityFilter} 
                    className="w-full text-xs"
                  >
                    Clear all compatibility filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.length > 0 && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                  Categories: {selectedCategories.length}
                  <FaTimes 
                    className="cursor-pointer ml-1" 
                    size={10} 
                    onClick={resetCategoryFilter}
                  />
                </Badge>
              )}
              
              {selectedBrands.length > 0 && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                  Brands: {selectedBrands.length}
                  <FaTimes 
                    className="cursor-pointer ml-1" 
                    size={10}
                    onClick={resetBrandFilter}
                  />
                </Badge>
              )}
              
              {initialPriceRange && 
                (priceRange.min !== Math.floor(initialPriceRange.min) || 
                priceRange.max !== Math.ceil(initialPriceRange.max)) && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                  Price: ${priceRange.min}-${priceRange.max}
                  <FaTimes 
                    className="cursor-pointer ml-1" 
                    size={10}
                    onClick={resetPriceFilter}
                  />
                </Badge>
              )}
              
              {Object.keys(compatibility).length > 0 && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                  Compatibility
                  <FaTimes 
                    className="cursor-pointer ml-1" 
                    size={10}
                    onClick={resetCompatibilityFilter}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilter;
