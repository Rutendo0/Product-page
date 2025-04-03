import { useState, useEffect } from "react";
import { type Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogClose,
} from "@/components/ui/dialog";
import { FaStar, FaStarHalfAlt, FaCheckCircle, FaHeart } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

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
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
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

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
        <DialogClose className="absolute top-4 right-4 text-neutral-dark hover:text-secondary z-10">
          <FaXmark className="h-5 w-5" />
        </DialogClose>
        
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 flex items-center justify-center bg-neutral-light">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-[400px] object-contain"
            />
          </div>
          
          <div className="md:w-1/2 p-6">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <span className="inline-block bg-neutral px-2 py-1 rounded text-xs uppercase tracking-wide mb-2">
                  {product.category}
                </span>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStarHalfAlt />
                  </div>
                  <span className="ml-2 text-sm text-neutral-dark">(24 reviews)</span>
                </div>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-secondary">${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className="text-sm line-through text-neutral-dark ml-2">${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <p className="text-green-600 mb-4">
                  <FaCheckCircle className="inline-block mr-1" /> In stock
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-neutral-dark">{product.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Specifications</h3>
                <ul className="text-sm space-y-2">
                  <li><span className="font-medium">Brand:</span> {product.brand || 'Generic'}</li>
                  <li><span className="font-medium">Part Number:</span> {product.sku || 'N/A'}</li>
                  <li><span className="font-medium">Compatibility:</span> Multiple Models</li>
                  <li><span className="font-medium">Warranty:</span> 1 Year</li>
                </ul>
              </div>
              
              <div className="mt-auto">
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
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-lg flex justify-center items-center"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 10H5L3 18H21L19 10H16M8 10V6C8 3.79086 9.79086 2 12 2V2C14.2091 2 16 3.79086 16 6V10M8 10H16" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Add to Cart
                  </button>
                  <button className="flex-shrink-0 border border-primary hover:bg-primary hover:text-white text-primary font-bold py-3 px-4 rounded-lg transition-colors">
                    <FaHeart className="inline-block" />
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
