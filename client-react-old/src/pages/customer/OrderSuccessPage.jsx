import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, Home } from 'lucide-react';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
      {/* Green Check Icon */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          ✓ Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Thank you for shopping with Tez Thaila. We're getting your bag ready for express delivery!
        </p>
      </div>

      {/* Order Snapshot Card */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md text-left space-y-4 max-w-lg mx-auto">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-xs">
          <span className="text-gray-500 font-medium">Order Number:</span>
          <span className="font-mono font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
            {orderId || order?.orderNumber || 'TT-2026-884920'}
          </span>
        </div>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total Amount Paid:</span>
            <span className="font-extrabold text-gray-900 text-sm">
              ₹{order?.totalAmount || '1039'}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold text-gray-800">
              {order?.paymentMethod === 'COD' ? 'Cash on Delivery (Pending)' : 'Razorpay Online (Paid)'}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Estimated Express Delivery:</span>
            <span className="font-bold text-emerald-700 flex items-center">
              <Truck className="w-3.5 h-3.5 mr-1" />
              Tomorrow by 11:00 AM
            </span>
          </div>

          {order?.address && (
            <div className="pt-2 border-t border-gray-100 text-[11px]">
              <span className="font-bold text-gray-700 block mb-0.5">Delivery Address:</span>
              <p className="text-gray-500">
                {order.address.fullName}, {order.address.house}, {order.address.street}, {order.address.city} - {order.address.pincode}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to={`/orders/${orderId || order?.orderNumber || 'TT-2026-884920'}`}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2"
        >
          <Package className="w-4 h-4" />
          <span>Track Order</span>
        </Link>

        <Link
          to="/products"
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
