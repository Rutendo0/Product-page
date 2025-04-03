import { useState, useEffect } from "react";
import { type Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  FaStar, 
  FaStarHalfAlt, 
  FaCheckCircle, 
  FaHeart, 
  FaShippingFast, 
  FaArrowLeft, 
  FaArrowRight,
  FaInfoCircle,
  FaTools,
  FaClipboardList
} from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { Badge } from "@/components/ui/badge";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  const handleAddToCart = () => {
    if (!product) return;
    
    onAddToCart(product, quantity);
    
    toast({
      title: "Added to cart",
      description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart.`,
      duration: 3000,
    });
    
    onClose();
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const toggleCompare = () => {
    setIsComparing(!isComparing);
    
    if (!isComparing) {
      toast({
        title: "Added to compare",
        description: "Product added to comparison list",
        duration: 3000,
      });
    }
  };

  if (!product) return null;

  // Get all product images
  const getProductImages = () => {
    const images = [];
    
    if (product.image) {
      images.push(product.image);
    }
    
    // @ts-ignore - The product might have an 'images' property from external API
    if (product.images && product.images.length > 0) {
      // @ts-ignore
      product.images.forEach(img => images.push(img.url));
    }
    
    return images.length > 0 ? images : ['https://via.placeholder.com/300x300?text=No+Image'];
  };
  
  const productImages = getProductImages();
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden max-h-[95vh] overflow-y-auto">
        <DialogClose className="absolute top-4 right-4 text-neutral-dark hover:text-secondary z-10">
          <FaXmark className="h-5 w-5" />
        </DialogClose>
        
        <div className="flex flex-col lg:flex-row">
          {/* Image section with gallery */}
          <div className="lg:w-1/2 p-6 bg-neutral-50">
            <div className="relative">
              {/* Main product image */}
              <div className="w-full h-[300px] md:h-[350px] bg-white rounded-lg mb-4 flex items-center justify-center overflow-hidden relative">
                {productImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage} 
                      className="absolute left-2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow text-primary"
                    >
                      <FaArrowLeft size={16} />
                    </button>
                    <button 
                      onClick={nextImage} 
                      className="absolute right-2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow text-primary"
                    >
                      <FaArrowRight size={16} />
                    </button>
                  </>
                )}
                <img 
                  src={productImages[currentImageIndex]} 
                  alt={`${product.name} - Image ${currentImageIndex + 1}`} 
                  className="max-h-full max-w-full object-contain p-4"
                />
              </div>
              
              {/* Thumbnail gallery */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button 
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                        index === currentImageIndex 
                          ? 'border-primary' 
                          : 'border-transparent hover:border-primary/30'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`Thumbnail ${index + 1}`} 
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Additional product information highlights */}
            <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-medium mb-2">Why Choose This Product</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                  <span>High Quality</span>
                </div>
                <div className="flex items-center">
                  <FaShippingFast className="text-primary mr-2 flex-shrink-0" />
                  <span>Fast Shipping</span>
                </div>
                {product.brand && (
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <span>Trusted Brand</span>
                  </div>
                )}
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                  <span>1 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product details section */}
          <div className="lg:w-1/2 p-6">
            <div className="flex flex-col h-full">
              <div className="mb-6">
                {/* Category badge */}
                {product.category && (
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                )}
                
                {/* Product title */}
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                
                {/* Ratings */}
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">(24 reviews)</span>
                </div>
                
                {/* Price */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-sm line-through text-muted-foreground ml-2">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* Stock status */}
                <p className="text-green-600 font-medium flex items-center mb-4">
                  <FaCheckCircle className="mr-2" /> In Stock & Ready to Ship
                </p>
              </div>
              
              {/* Tabbed content for product details */}
              <Tabs defaultValue="details" className="mb-6">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="details" className="flex items-center">
                    <FaInfoCircle className="mr-2" /> Details
                  </TabsTrigger>
                  <TabsTrigger value="specs" className="flex items-center">
                    <FaTools className="mr-2" /> Specifications
                  </TabsTrigger>
                  <TabsTrigger value="compatibility" className="flex items-center">
                    <FaClipboardList className="mr-2" /> Compatibility
                  </TabsTrigger>
                </TabsList>
                
                {/* Details tab */}
                <TabsContent value="details" className="space-y-4 mt-4">
                  {product.description && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.description || "This premium automotive part is designed for optimal performance and longevity. Engineered with high-quality materials to meet or exceed OEM specifications."}
                      </p>
                    </div>
                  )}
                  
                  {/* @ts-ignore */}
                  {product.industry && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Industry</h3>
                      <p className="text-sm text-muted-foreground">
                        {/* @ts-ignore */}
                        {product.industry}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Features</h3>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Premium quality construction</li>
                      <li>• Direct OEM replacement</li>
                      <li>• Easy installation process</li>
                      <li>• Tested for reliability and durability</li>
                    </ul>
                  </div>
                </TabsContent>
                
                {/* Specifications tab */}
                <TabsContent value="specs" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Brand */}
                    {product.brand && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">BRAND</h3>
                        <p className="font-medium">{product.brand}</p>
                      </div>
                    )}
                    
                    {/* OEM */}
                    {/* @ts-ignore */}
                    {product.OEM && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">OEM NUMBER</h3>
                        {/* @ts-ignore */}
                        <p className="font-medium">{product.OEM}</p>
                      </div>
                    )}
                    
                    {/* SKU/Part Number */}
                    {product.sku && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">PART NUMBER</h3>
                        <p className="font-medium">{product.sku}</p>
                      </div>
                    )}
                    
                    {/* Weight (example) */}
                    <div className="space-y-1">
                      <h3 className="text-xs font-medium text-muted-foreground">WARRANTY</h3>
                      <p className="font-medium">12 Months</p>
                    </div>
                    
                    {/* Dimensions (example) */}
                    <div className="space-y-1">
                      <h3 className="text-xs font-medium text-muted-foreground">RETURN POLICY</h3>
                      <p className="font-medium">30 Days</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Compatibility tab */}
                <TabsContent value="compatibility" className="space-y-4 mt-4">
                  {/* @ts-ignore */}
                  {(product.model || product.year) ? (
                    <div className="space-y-2">
                      <h3 className="font-medium">Compatible Vehicles</h3>
                      <div className="bg-neutral-50 rounded-md p-4">
                        {/* @ts-ignore */}
                        {product.model && (
                          <div className="flex mb-2">
                            <span className="font-medium w-20">Model:</span>
                            {/* @ts-ignore */}
                            <span>{product.model}</span>
                          </div>
                        )}
                        {/* @ts-ignore */}
                        {product.year && (
                          <div className="flex">
                            <span className="font-medium w-20">Year:</span>
                            {/* @ts-ignore */}
                            <span>{product.year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No specific compatibility information available for this product.
                      </p>
                      <p className="text-sm mt-2">
                        Please check your vehicle specifications or contact customer support for compatibility information.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Quantity selector and action buttons */}
              <div className="mt-auto border-t pt-4">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <label htmlFor="modal-quantity" className="block text-sm font-medium mb-1">Quantity</label>
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <button 
                        onClick={decreaseQuantity}
                        className="px-3 py-1 bg-neutral hover:bg-neutral-dark hover:text-white transition-colors"
                      >
                        -
                      </button>
                      <input 
                        id="modal-quantity" 
                        type="number" 
                        value={quantity} 
                        min="1" 
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 text-center border-none focus:ring-0"
                      />
                      <button 
                        onClick={increaseQuantity}
                        className="px-3 py-1 bg-neutral hover:bg-neutral-dark hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Add to cart button */}
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg flex justify-center items-center"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 10H5L3 18H21L19 10H16M8 10V6C8 3.79086 9.79086 2 12 2V2C14.2091 2 16 3.79086 16 6V10M8 10H16" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add to Cart
                  </button>
                  
                  {/* Compare button */}
                  <button 
                    onClick={toggleCompare}
                    className={`flex-shrink-0 border font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                      isComparing 
                        ? 'bg-primary text-white border-primary' 
                        : 'border-gray-300 hover:border-primary text-gray-700 hover:text-primary'
                    }`}
                  >
                    {isComparing ? 'Added to Compare' : 'Compare'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
