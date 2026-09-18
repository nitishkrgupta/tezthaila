import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  Truck, 
  ArrowLeft,
  Banknote,
  X
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import RazorpayModal from '../../components/common/RazorpayModal';
import api from '../../services/api';

export default function CheckoutPage() {
  const { cart, cartSubtotal, discount, shippingFee, tax, totalAmount, coupon, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' or 'COD'
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New address form state
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Rahul Sharma',
    phone: '9876543211',
    house: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    landmark: ''
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    const loadAddresses = async () => {
      try {
        const res = await api.addresses.list();
        setAddresses(res.data || []);
        const defaultAddr = res.data?.find((a) => a.isDefault) || res.data?.[0];
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (err) {
        console.error('Failed loading addresses', err);
      }
    };

    loadAddresses();
  }, [cart, navigate]);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.house || !formData.street || !formData.pincode) {
      addToast('Please fill all mandatory address fields', 'error');
      return;
    }

    try {
      const res = await api.addresses.create(formData);
      setAddresses((prev) => [...prev, res.data]);
      setSelectedAddressId(res.data.id);
      setIsNewAddressModalOpen(false);
      addToast('New delivery address saved');
    } catch (err) {
      addToast(err.message || 'Failed saving address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      addToast('Please choose or add a delivery address', 'error');
      return;
    }

    if (paymentMethod === 'RAZORPAY') {
      setIsRazorpayOpen(true);
    } else {
      // Cash on Delivery
      await submitFinalOrder('COD', 'PENDING');
    }
  };

  const handleRazorpaySuccess = async (paymentData) => {
    setIsRazorpayOpen(false);
    await submitFinalOrder('RAZORPAY', 'PAID', paymentData);
  };

  const submitFinalOrder = async (method, payStatus, paymentDetails = null) => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        addressId: selectedAddressId,
        paymentMethod: method,
        paymentStatus: payStatus,
        couponCode: coupon?.code || null,
        items: cart,
        subtotal: cartSubtotal,
        discount,
        shippingFee,
        tax,
        totalAmount,
        paymentDetails
      };

      const res = await api.orders.create(orderPayload);
      clearCart();
      addToast('🎉 Order placed successfully!');
      navigate(`/order-success/${res.data.orderNumber}`, { state: { order: res.data } });
    } catch (err) {
      addToast(err.message || 'Failed placing order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Express Checkout</h1>
          <p className="text-xs text-gray-500 mt-0.5">Step-by-step secure delivery &amp; payment confirmation</p>
        </div>
        <Link to="/cart" className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          <span>Back to Bag</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Address & Payment (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-gray-900">Delivery Address</h3>
              </div>

              <button
                onClick={() => setIsNewAddressModalOpen(true)}
                className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Address Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedAddressId === addr.id
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-gray-900">{addr.fullName}</span>
                      {selectedAddressId === addr.id && (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {addr.house}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.landmark && (
                      <p className="text-[11px] text-gray-400 mt-0.5">Landmark: {addr.landmark}</p>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-700 mt-2">Ph: {addr.phone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-gray-900">Choose Payment Method</h3>
            </div>

            <div className="space-y-3">
              {/* Razorpay Option */}
              <label
                className={`p-4 rounded-2xl border flex items-start space-x-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="mt-1 accent-brand-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-gray-900">
                      Razorpay Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Pay securely using Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard or NetBanking.
                  </p>
                </div>
              </label>

              {/* Cash On Delivery Option */}
              <label
                className={`p-4 rounded-2xl border flex items-start space-x-3.5 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-brand-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Pay with cash or UPI to the delivery executive when your package arrives.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Items & Place Order (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">
              Order Review ({cart.length} items)
            </h3>

            {/* Quick mini-list */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="truncate max-w-[180px] text-gray-700 font-medium">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-gray-800">₹{cartSubtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({coupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-gray-800">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="font-bold text-gray-800">₹{tax}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline text-sm font-black text-gray-900">
                <span>Total Amount:</span>
                <span className="text-xl text-brand-800 font-black">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-101 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <span>Confirm &amp; Place Order (₹{totalAmount})</span>
              )}
            </button>

            <div className="text-[11px] text-gray-400 text-center flex items-center justify-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-brand-600" />
              <span>Express Delivery in 2 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW ADDRESS MODAL */}
      {isNewAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Indian Delivery Address</h3>
              <button onClick={() => setIsNewAddressModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">10-digit Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Flat / House No. / Building</label>
                <input
                  type="text"
                  required
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                  placeholder="e.g. Flat 302, Sai Residency"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Street / Colony / Area</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="e.g. 100 Feet Road, Indiranagar"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="e.g. Near Metro Station"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewAddressModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 font-bold rounded-xl text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RAZORPAY PAYMENT SIMULATION MODAL */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        amount={totalAmount}
        onSuccess={handleRazorpaySuccess}
        onCancel={() => setIsRazorpayOpen(false)}
      />
    </div>
  );
}
