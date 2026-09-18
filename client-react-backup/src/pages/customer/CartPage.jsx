import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  ArrowLeft,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { 
    cart, 
    cartSubtotal, 
    discount, 
    shippingFee, 
    tax, 
    totalAmount, 
    coupon, 
    updateQuantity, 
    removeFromCart, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
    setCouponInput('');
  };

  const applySuggestedCoupon = async (code) => {
    setIsApplying(true);
    await applyCoupon(code);
    setIsApplying(false);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Looks like you haven't added anything yet! Discover farm fresh groceries, pure dairy, snacks, and daily essentials with express delivery.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-600/20"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {cart.length} unique items • Free Express Delivery on orders above ₹499
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.thumbnail}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                />
                <div>
                  <Link
                    to={`/product/${item.slug}`}
                    className="text-sm font-bold text-gray-900 hover:text-brand-700 line-clamp-1"
                  >
                    {item.productName}
                  </Link>
                  {item.variantName && (
                    <span className="text-xs text-gray-500 font-medium block mt-0.5">{item.variantName}</span>
                  )}
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-sm font-extrabold text-gray-900">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                {/* Stepper */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1 border border-gray-200">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-gray-700 hover:bg-gray-50 shadow-xs"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-gray-900 w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-gray-700 hover:bg-gray-50 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Remove */}
                <div className="text-right">
                  <span className="text-sm font-black text-gray-900 block">₹{item.subtotal}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold flex items-center mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Delivery Assurance */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60 flex items-center space-x-3 text-emerald-900 text-xs">
            <Truck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Tez Thaila Express Assurance</p>
              <p className="text-[11px] text-emerald-700">All items packaged in eco-friendly insulated bags.</p>
            </div>
          </div>
        </div>

        {/* Price Breakdown & Coupon Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Apply Coupons &amp; Offers</span>
            </div>

            {coupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-emerald-900">{coupon.code}</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}% discount applied` : `₹${coupon.value} flat discount applied`}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-emerald-800 hover:text-emerald-950 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl uppercase font-mono font-bold focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={isApplying}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Quick Coupons Shortcuts */}
            {!coupon && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Available Coupons</p>
                <div className="space-y-1.5">
                  {[
                    { code: 'WELCOME10', desc: '10% off on orders above ₹499' },
                    { code: 'SAVE500', desc: 'Flat ₹500 off on cart above ₹2499' }
                  ].map((c) => (
                    <div
                      key={c.code}
                      onClick={() => applySuggestedCoupon(c.code)}
                      className="p-2 rounded-xl bg-gray-50 hover:bg-brand-50 border border-gray-200/80 cursor-pointer flex justify-between items-center transition-colors text-xs"
                    >
                      <div>
                        <span className="font-bold text-brand-700 font-mono">{c.code}</span>
                        <p className="text-[10px] text-gray-500">{c.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-brand-700">Apply</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-800">₹{cartSubtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-bold text-gray-800">
                  {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Taxes (GST)</span>
                <span className="font-bold text-gray-800">₹{tax}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline text-sm font-black text-gray-900">
                <span>Total Amount</span>
                <span className="text-xl text-brand-800 font-black">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-101"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[10px] text-gray-400 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe &amp; Encrypted Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
