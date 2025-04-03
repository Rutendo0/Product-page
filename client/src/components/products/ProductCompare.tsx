import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FaTools, FaCar, FaShippingFast, FaInfoCircle } from "react-icons/fa";
import { type Product } from "@shared/schema";

interface ProductCompareProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCompare: React.FC<ProductCompareProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onAddToCart,
}) => {
  const [comparableProducts, setComparableProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen && products.length) {
      setComparableProducts(products.slice(0, 4)); // Limit to 4 products for comparison
    }
  }, [isOpen, products]);

  // Get product image from the images array if it exists
  const getProductImage = (product: Product) => {
    if (product.image) return product.image;
    // @ts-ignore - The product might have an 'images' property from external API
    if (product.images && product.images.length > 0 && product.images[0].url) {
      // @ts-ignore
      return product.images[0].url;
    }
    return 'https://via.placeholder.com/150x150?text=No+Image';
  };

  // Get all specs that should be compared
  const getComparisonSpecs = () => {
    const specs: { label: string; key: string; category: string }[] = [
      // Basic information
      { label: "Price", key: "price", category: "Basic" },
      { label: "Brand", key: "brand", category: "Basic" },
      { label: "Category", key: "category", category: "Basic" },
      
      // Technical specs - Using ts-ignore for external API fields
      { label: "OEM Number", key: "OEM", category: "Technical" },
      { label: "Model Compatibility", key: "model", category: "Technical" },
      { label: "Year", key: "year", category: "Technical" },
      { label: "Industry", key: "industry", category: "Technical" },
    ];

    return specs;
  };

  // Organize specs by category
  const specsByCategory = getComparisonSpecs().reduce<Record<string, {
    label: string;
    key: string;
    category: string;
  }[]>>((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {});

  // Get value of a specific spec from a product
  const getSpecValue = (product: Product, key: string) => {
    if (key === "price") {
      return `$${product[key].toFixed(2)}`;
    }
    
    // @ts-ignore - For OEM, model, year, and industry from external API
    if (product[key] !== undefined) {
      // @ts-ignore
      return product[key];
    }
    
    return "N/A";
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold">Compare Products</DialogTitle>
            <DialogClose className="text-neutral-dark hover:text-secondary">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
          <DialogDescription className="text-sm pt-2">
            Compare specifications and features of selected products side by side.
          </DialogDescription>
        </DialogHeader>

        {comparableProducts.length === 0 ? (
          <div className="p-8 text-center">
            <FaInfoCircle className="mx-auto h-10 w-10 text-neutral-dark mb-4" />
            <h3 className="text-lg font-medium mb-2">No products to compare</h3>
            <p className="text-muted-foreground mb-4">
              You haven't added any products to the comparison list yet.
            </p>
            <Button onClick={onClose} variant="outline">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="px-6 py-4">
            {/* Products header row */}
            <div className="grid grid-cols-[150px_repeat(auto-fill,minmax(180px,1fr))] gap-4 mb-6">
              <div className="text-sm font-medium pt-6">Product</div>
              {comparableProducts.map((product) => (
                <div key={product.productId} className="flex flex-col items-center relative">
                  <button 
                    onClick={() => onRemoveProduct(product.productId)}
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow-sm p-1 hover:bg-neutral-light"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="w-24 h-24 p-2 bg-white rounded-lg border flex items-center justify-center mb-2">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-center">{product.name}</h3>
                  <p className="text-primary font-bold mt-1">${product.price.toFixed(2)}</p>
                  <Button 
                    size="sm" 
                    className="mt-2 w-full"
                    onClick={() => onAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Comparison specs by category */}
            {Object.entries(specsByCategory).map(([category, specs]) => (
              <div key={category} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {category === "Basic" && <FaInfoCircle className="text-primary" />}
                  {category === "Technical" && <FaTools className="text-primary" />}
                  <h3 className="font-bold">{category} Information</h3>
                </div>

                {specs.map((spec) => (
                  <div 
                    key={spec.key} 
                    className="grid grid-cols-[150px_repeat(auto-fill,minmax(180px,1fr))] gap-4 py-3 border-b last:border-none"
                  >
                    <div className="text-sm font-medium">{spec.label}</div>
                    
                    {comparableProducts.map((product) => {
                      const value = getSpecValue(product, spec.key);
                      return (
                        <div key={`${product.productId}-${spec.key}`} className="text-center px-2">
                          {value === "N/A" ? (
                            <span className="text-sm text-muted-foreground">Not available</span>
                          ) : (
                            <span className="text-sm">{value}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductCompare;