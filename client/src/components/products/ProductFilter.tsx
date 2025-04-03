import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import PriceSlider from "@/components/ui/price-slider";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
  });

  const { data: initialPriceRange } = useQuery({
    queryKey: ['/api/price-range'],
  });

  useEffect(() => {
    if (initialPriceRange) {
      setPriceRange({
        min: Math.floor(initialPriceRange.min),
        max: Math.ceil(initialPriceRange.max)
      });
    }
  }, [initialPriceRange]);

  useEffect(() => {
    onFilterChange({
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      compatibility: Object.keys(compatibility).length > 0 ? compatibility : undefined
    });
  }, [selectedCategories, selectedBrands, priceRange, compatibility]);

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
    setCompatibility({ ...compatibility, [key]: value });
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
    onResetFilters();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filters</h2>
        <button onClick={handleClearFilters} className="text-secondary text-sm hover:underline">
          Clear all
        </button>
      </div>

      <div className="space-y-4">
        {/* Category filter */}
        <div className="border-b pb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setCategoryOpen(!categoryOpen)}
          >
            <span>Category</span>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`mt-2 space-y-2 ${categoryOpen ? '' : 'hidden'}`}>
            {categories.map((category: string) => (
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
            ))}
          </div>
        </div>

        {/* Price filter */}
        <div className="border-b pb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setPriceOpen(!priceOpen)}
          >
            <span>Price Range</span>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${priceOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={priceOpen ? '' : 'hidden'}>
            <PriceSlider
              min={initialPriceRange?.min || 0}
              max={initialPriceRange?.max || 500}
              initialMin={priceRange.min}
              initialMax={priceRange.max}
              onChange={handlePriceChange}
            />
          </div>
        </div>

        {/* Brand filter */}
        <div className="border-b pb-4">
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setBrandOpen(!brandOpen)}
          >
            <span>Brand</span>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${brandOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`mt-2 space-y-2 ${brandOpen ? '' : 'hidden'}`}>
            {brands.map((brand: string) => (
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
            ))}
          </div>
        </div>

        {/* Compatibility filter */}
        <div>
          <button
            className="flex items-center justify-between w-full text-left font-medium"
            onClick={() => setCompatibilityOpen(!compatibilityOpen)}
          >
            <span>Vehicle Compatibility</span>
            <FaChevronDown className={`text-sm transition-transform duration-200 ${compatibilityOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`mt-2 space-y-3 ${compatibilityOpen ? '' : 'hidden'}`}>
            <Select
              value={compatibility.make}
              onValueChange={(value) => handleCompatibilityChange('make', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toyota">Toyota</SelectItem>
                <SelectItem value="honda">Honda</SelectItem>
                <SelectItem value="ford">Ford</SelectItem>
                <SelectItem value="bmw">BMW</SelectItem>
                <SelectItem value="mercedes">Mercedes</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={compatibility.model}
              onValueChange={(value) => handleCompatibilityChange('model', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camry">Camry</SelectItem>
                <SelectItem value="civic">Civic</SelectItem>
                <SelectItem value="f150">F-150</SelectItem>
                <SelectItem value="3series">3 Series</SelectItem>
                <SelectItem value="cclass">C-Class</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={compatibility.year}
              onValueChange={(value) => handleCompatibilityChange('year', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
