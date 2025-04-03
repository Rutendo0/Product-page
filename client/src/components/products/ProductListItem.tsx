import { type Product } from "@shared/schema";
import { useState } from "react";
import { FaShoppingCart, FaHeart, FaStar, FaStarHalfAlt, FaExchangeAlt } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

interface ProductListItemProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onProductClick,
  onAddToCart,
  onAddToCompare,
}) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);

    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isFavorite ? "removed from" : "added to"} your wishlist.`,
      duration: 3000,
    });
  };
  
  const handleAddToCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCompare) {
      onAddToCompare(product);
      
      toast({
        title: "Added to compare",
        description: `${product.name} has been added to comparison.`,
        duration: 3000,
      });
    }
  };

  // Get product image from the images array if it exists
  const getProductImage = () => {
    if (product.image) return product.image;
    // @ts-ignore - The product might have an 'images' property from external API
    if (product.images && product.images.length > 0 && product.images[0].url) {
      // @ts-ignore
      return product.images[0].url;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  };

  const calculateDiscount = () => {
    if (product.originalPrice) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return 0;
  };

  const discount = calculateDiscount();

  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      <div className="relative md:w-1/4 flex-shrink-0">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-full h-48 md:h-full object-contain bg-neutral-light"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
      </div>
      <div className="p-4 md:p-6 md:w-3/4 flex flex-col">
        <div className="mb-1 text-sm text-neutral-dark">{product.category || 'General'}</div>
        <h3 className="font-semibold text-xl mb-2 hover:text-secondary">{product.name}</h3>
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStarHalfAlt />
          </div>
          <span className="ml-2 text-sm text-neutral-dark">({Math.floor(Math.random() * 50) + 5})</span>
        </div>
        
        {/* Display product information with fallbacks */}
        <div className="text-neutral-dark flex-grow mb-4">
          {product.brand && (
            <p className="mb-2"><span className="font-medium">Brand:</span> {product.brand}</p>
          )}
          
          {/* @ts-ignore - Handle OEM property if exists */}
          {product.OEM && (
            <p className="mb-2"><span className="font-medium">OEM:</span> {product.OEM}</p>
          )}
          
          {/* @ts-ignore - Handle model property if exists */}
          {product.model && (
            <p className="mb-2"><span className="font-medium">Model:</span> {product.model}</p>
          )}
          
          {/* @ts-ignore - Handle year property if exists */}
          {product.year && (
            <p className="mb-2"><span className="font-medium">Year:</span> {product.year}</p>
          )}
          
          {product.description && (
            <p className="mt-3">{product.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap justify-between items-center">
          <div className="mb-2 md:mb-0">
            <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm line-through text-neutral-dark ml-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              className={`border border-primary ${isFavorite ? 'bg-primary text-white' : 'text-primary hover:bg-primary hover:text-white'} px-3 py-2 rounded-lg transition-colors`}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              <FaHeart className="mr-1 inline-block" /> Wishlist
            </button>
            {onAddToCompare && (
              <button 
                className="border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white px-3 py-2 rounded-lg transition-colors"
                onClick={handleAddToCompare}
                aria-label="Add to compare"
              >
                <FaExchangeAlt className="mr-1 inline-block" /> Compare
              </button>
            )}
            <button 
              className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg transition-colors add-to-cart-btn"
              onClick={handleAddToCart}
              aria-label="Add to cart"
            >
              <FaShoppingCart className="mr-1 inline-block" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListItem;
