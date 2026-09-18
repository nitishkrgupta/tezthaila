import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, product.variants?.[0] || null, 1);
    toggleWishlist(product);
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl mx-auto flex items-center justify-center mb-4">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Save products you love so you can easily track deals and move them to your shopping bag anytime!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-xs text-gray-500 mt-0.5">{wishlist.length} saved products</p>
        </div>
        <Link to="/products" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative pt-[80%] rounded-xl overflow-hidden bg-gray-50 mb-3">
                <img src={product.thumbnail} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-xs"
                  title="Remove from Wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] font-bold text-brand-700 block">{product.brandName}</span>
              <Link to={`/product/${product.slug}`} className="text-xs font-bold text-gray-900 hover:text-brand-700 line-clamp-2 mt-0.5">
                {product.name}
              </Link>
            </div>

            <div className="pt-3 border-t border-gray-100 mt-3 space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-sm font-black text-gray-900">₹{product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                )}
              </div>

              <button
                onClick={() => handleMoveToCart(product)}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
