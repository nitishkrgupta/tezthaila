import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    cartCount, 
    cartSubtotal, 
    updateQuantity, 
    removeFromCart 
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const freeShippingThreshold = 499;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercentage = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-gray-900">Your Shopping Bag ({cartCount})</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-3 bg-brand-50/70 border-b border-brand-100 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div>
                <p className="text-brand-900 font-medium mb-1.5">
                  Add <span className="font-bold text-brand-700">₹{remainingForFreeShipping}</span> more for <span className="font-bold text-emerald-700">FREE Express Delivery</span>
                </p>
                <div className="w-full bg-brand-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-700 font-bold flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
                🎉 You've unlocked FREE Express Delivery!
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 mx-auto flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">Your bag is empty</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Explore daily staples, farm fresh vegetables, dairy and top electronics!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex space-x-3 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
                  <img
                    src={item.thumbnail}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.productName}</h4>
                      {item.variantName && (
                        <span className="text-[11px] text-gray-500 font-medium">{item.variantName}</span>
                      )}
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xs font-extrabold text-gray-900">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-brand-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-brand-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-rose-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-white space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                <span>Subtotal:</span>
                <span className="text-base font-extrabold text-gray-900">₹{cartSubtotal}</span>
              </div>
              <p className="text-[11px] text-gray-400">Taxes and discounts calculated at checkout</p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="py-2.5 px-3 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors"
                >
                  View Full Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1 shadow-md shadow-brand-600/20 transition-colors"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
