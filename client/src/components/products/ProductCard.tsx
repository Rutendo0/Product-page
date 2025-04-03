import { type Product } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTiltEffect } from "@/hooks/use-tilt-effect";
import { FaShoppingCart, FaHeart, FaStar, FaStarHalfAlt, FaExchangeAlt } from "react-icons/fa";
import "./ProductShineEffect.css";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAddToCompare?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  onAddToCompare,
}) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Use our custom tilt effect hook with some configuration options
  const { 
    tiltRef, 
    tiltStyles, 
    handleMouseMove, 
    handleMouseEnter, 
    handleMouseLeave 
  } = useTiltEffect({
    max: 10,           // Maximum tilt rotation (degrees)
    perspective: 1000, // Perspective value for 3D effect
    scale: 1.03,       // Scale factor on hover (subtle)
    speed: 300,        // Transition speed in ms
  });

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
      ref={tiltRef}
      style={tiltStyles}
      className="product-card bg-white rounded-lg overflow-hidden transform-gpu cursor-pointer group border border-transparent hover:border-primary/20 will-change-transform"
      onClick={() => onProductClick(product)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative overflow-hidden">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="product-image w-full h-52 object-contain bg-neutral-50 p-2"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm transform -rotate-3">
            {discount}% OFF
          </span>
        )}
        <div className="absolute right-0 top-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:right-2 flex flex-col gap-2">
          <button 
            className="bg-white shadow-md hover:bg-opacity-100 p-2 rounded-full text-neutral-dark hover:text-rose-500 transition-colors"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart className={isFavorite ? "text-rose-500" : ""} />
          </button>
          <button 
            className="bg-white shadow-md hover:bg-opacity-100 p-2 rounded-full text-neutral-dark hover:text-primary transition-colors"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FaShoppingCart />
          </button>
          {onAddToCompare && (
            <button 
              className="bg-white shadow-md hover:bg-opacity-100 p-2 rounded-full text-neutral-dark hover:text-amber-500 transition-colors"
              onClick={handleAddToCompare}
              aria-label="Add to compare"
            >
              <FaExchangeAlt />
            </button>
          )}
        </div>
        {product.stock === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-800 bg-opacity-75 text-white text-center py-1 text-sm">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 text-sm font-medium text-primary/70">{product.category || 'General'}</div>
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-amber-400 text-sm">
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStarHalfAlt />
          </div>
          <span className="ml-1 text-xs text-neutral-dark">({Math.floor(Math.random() * 50) + 5})</span>
        </div>
        {/* Show brand if available, otherwise description */}
        {product.brand ? (
          <p className="text-neutral-dark text-sm mb-3">Brand: <span className="font-medium">{product.brand}</span></p>
        ) : (
          <p className="text-neutral-dark text-sm line-clamp-2 mb-3">{product.description || "No description available"}</p>
        )}
        <div className="pt-2 border-t flex justify-between items-center">
          <div>
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm line-through text-neutral-dark ml-1">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button 
            className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full shadow-sm transition-all hover:shadow-md hover:scale-105 add-to-cart-btn"
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
