import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Truck, CheckCircle2, Clock, XCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.orders.list();
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed fetching orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Cancelled</span>;
      case 'RETURN_REQUESTED':
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Return Requested</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">In Progress ({status})</span>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4" />
        <div className="h-32 bg-gray-200 rounded-2xl mb-4" />
        <div className="h-32 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order History</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your packages, view receipts, and request returns</p>
        </div>
        <Link to="/products" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Shop More</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">You haven't placed any orders yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Order your first grocery bag or tech gear and experience express delivery!
          </p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 hover:border-brand-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(order.orderStatus)}
                  <span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 overflow-x-auto py-1">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex items-center space-x-2 flex-shrink-0 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <img src={it.thumbnail} alt={it.productName} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="text-[11px] max-w-[140px] truncate">
                        <p className="font-bold text-gray-900 truncate">{it.productName}</p>
                        <p className="text-gray-500">Qty: {it.quantity} • ₹{it.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl flex items-center space-x-1 flex-shrink-0 transition-colors"
                >
                  <span>Track &amp; Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
