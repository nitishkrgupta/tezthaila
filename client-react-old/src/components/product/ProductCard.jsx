import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Find if this product is already in the cart
  const cartItem = cart.find((item) => item.productId === product.id);
  const isWishlisted = isInWishlist(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    addToCart(product, defaultVariant, 1);
  };

  const handleIncrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity - 1);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 hover:border-brand-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Discount Badge */}
      {product.discountPercentage > 0 && (
        <span className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
          {product.discountPercentage}% OFF
        </span>
      )}

      {/* Wishlist Icon Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isWishlisted
            ? 'bg-rose-50 text-rose-600'
            : 'bg-white/80 backdrop-blur-xs text-gray-400 hover:text-rose-500 hover:bg-white shadow-xs'
        }`}
        title="Save to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.slug}`} className="relative pt-[80%] overflow-hidden bg-gray-50">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
            <span className="font-semibold text-brand-700">{product.brandName || 'Tez Select'}</span>
            {product.rating && (
              <span className="flex items-center text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                {product.rating}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-brand-700 transition-colors mb-2"
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Add to Cart Section */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-sm sm:text-base font-black text-gray-900">₹{product.price}</span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-gray-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            {product.variants && product.variants.length > 0 && (
              <p className="text-[10px] text-gray-500">{product.variants[0].value}</p>
            )}
          </div>

          {/* Action Button: Add or Stepper */}
          {cartItem ? (
            <div className="flex items-center space-x-1.5 bg-brand-700 text-white rounded-xl p-1 shadow-xs">
              <button
                onClick={handleDecrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-brand-800 rounded-lg transition-colors"
                title="Decrease"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold w-4 text-center">{cartItem.quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-6 h-6 flex items-center justify-center hover:bg-brand-800 rounded-lg transition-colors"
                title="Increase"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-300 hover:border-transparent rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
