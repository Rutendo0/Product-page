import { type Product } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FaShoppingCart, FaHeart, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
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
      className="bg-white rounded-lg shadow overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onProductClick(product)}
    >
      <div className="relative">
        <img 
          src={getProductImage()} 
          alt={product.name} 
          className="w-full h-48 object-contain bg-neutral-light"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded">
            {discount}% OFF
          </span>
        )}
        <button 
          className="absolute top-2 right-2 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full text-neutral-dark hover:text-secondary transition-colors"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FaHeart className={isFavorite ? "text-secondary" : ""} />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-1 text-sm text-neutral-dark">{product.category || 'General'}</div>
        <h3 className="font-semibold text-lg mb-2 hover:text-secondary line-clamp-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400 text-sm">
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
          <p className="text-neutral-dark text-sm mb-3">Brand: {product.brand}</p>
        ) : (
          <p className="text-neutral-dark text-sm line-clamp-2 mb-3">{product.description || "No description available"}</p>
        )}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm line-through text-neutral-dark ml-1">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button 
            className="bg-primary hover:bg-primary-light text-white p-2 rounded-full transition-colors add-to-cart-btn"
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
