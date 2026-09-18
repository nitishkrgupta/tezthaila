import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  X, 
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found cheaper elsewhere');
  const [returnReason, setReturnReason] = useState('Item damaged or expired');
  const { addToast } = useToast();

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await api.orders.getById(id);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed loading order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    try {
      await api.orders.cancel(order.orderNumber, cancelReason);
      setIsCancelModalOpen(false);
      addToast('Order cancelled successfully');
      loadOrder();
    } catch (err) {
      addToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const handleRequestReturn = async () => {
    try {
      await api.orders.returnRequest(order.orderNumber, returnReason);
      setIsReturnModalOpen(false);
      addToast('Return request submitted. Pickup in 48 hours.');
      loadOrder();
    } catch (err) {
      addToast(err.message || 'Failed requesting return', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />
        <div className="h-48 bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <Link to="/orders" className="text-brand-600 font-bold text-xs">Back to Orders</Link>
      </div>
    );
  }

  const trackingSteps = [
    { key: 'ORDER_PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStepIndex = trackingSteps.findIndex((s) => s.key === order.orderStatus);
  const isDelivered = order.orderStatus === 'DELIVERED';
  const isCancelled = order.orderStatus === 'CANCELLED';
  const isReturnRequested = order.orderStatus === 'RETURN_REQUESTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2">
            <Link to="/orders" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Status Actions */}
        <div className="flex items-center space-x-2">
          {!isCancelled && !isDelivered && !isReturnRequested && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl"
            >
              Cancel Order
            </button>
          )}

          {isDelivered && !isReturnRequested && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="px-3.5 py-1.5 border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Return</span>
            </button>
          )}
        </div>
      </div>

      {/* TRACKING TIMELINE CARD */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 text-xs">
          <div>
            <span className="text-gray-400 font-medium">Tracking Number: </span>
            <span className="font-mono font-bold text-gray-800">{order.trackingNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 font-medium">Estimated Express Delivery: </span>
            <span className="font-bold text-emerald-700">Tomorrow by 11:00 AM</span>
          </div>
        </div>

        {/* Visual Progress Stepper */}
        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">This order was cancelled</p>
              <p className="text-[11px] text-rose-700 font-normal">Reason: {order.cancelReason || 'Cancelled by customer'}</p>
            </div>
          </div>
        ) : (
          <div className="relative pt-4 pb-2">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-center">
              {trackingSteps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                        isPassed
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[11px] leading-tight ${
                        isCurrent
                          ? 'font-black text-brand-800'
                          : isPassed
                          ? 'font-bold text-gray-800'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ITEMS SNAPSHOT */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
          Items Ordered ({order.items?.length || 0})
        </h3>

        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="flex items-center space-x-3">
                <img
                  src={item.thumbnail}
                  alt={item.productName}
                  className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.productName}</h4>
                  {item.variantName && (
                    <span className="text-[11px] text-gray-500">{item.variantName}</span>
                  )}
                  <p className="text-xs text-gray-600 mt-0.5">
                    Qty: {item.quantity} × ₹{item.price}
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-gray-900">₹{item.subtotal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ADDRESS & PAYMENT BREAKDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Address card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2 text-xs">
          <h3 className="font-bold text-gray-900 flex items-center pb-2 border-b border-gray-100">
            <MapPin className="w-4 h-4 mr-1.5 text-brand-600" />
            <span>Delivery Destination</span>
          </h3>
          {order.address ? (
            <div className="space-y-1 text-gray-600 pt-1">
              <p className="font-bold text-gray-900">{order.address.fullName}</p>
              <p>{order.address.house}, {order.address.street}</p>
              <p>{order.address.area}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
              <p className="font-semibold text-gray-800">Phone: {order.address.phone}</p>
            </div>
          ) : (
            <p className="text-gray-400">Default delivery address</p>
          )}
        </div>

        {/* Payment & Charges */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5 text-xs text-gray-600">
          <h3 className="font-bold text-gray-900 pb-2 border-b border-gray-100">
            Payment &amp; Charges
          </h3>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold text-gray-800">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
          </div>
          <div className="flex justify-between">
            <span>Items Subtotal:</span>
            <span>₹{order.subtotal}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Discount:</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Express Shipping:</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes (GST):</span>
            <span>₹{order.tax}</span>
          </div>
          <div className="pt-2 border-t border-gray-100 flex justify-between font-black text-sm text-gray-900">
            <span>Total Paid:</span>
            <span className="text-brand-800 text-base">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* CANCEL MODAL */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Cancel Order #{order.orderNumber}</h3>
              <button onClick={() => setIsCancelModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Are you sure you want to cancel this order? Please select a reason:
            </p>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            >
              <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Delivery delay expected">Delivery delay expected</option>
              <option value="Change in address">Change in address</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Request Return / Refund</h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Please share the issue with your delivered order. Our executive will visit your address to inspect and pick up the item.
            </p>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
            >
              <option value="Item damaged or expired">Item damaged or expired</option>
              <option value="Wrong product delivered">Wrong product delivered</option>
              <option value="Quality not as described">Quality not as described</option>
              <option value="Missing contents in package">Missing contents in package</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReturn}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
