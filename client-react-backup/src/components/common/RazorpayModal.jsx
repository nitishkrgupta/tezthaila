import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Smartphone, CreditCard, Building2, Wallet } from 'lucide-react';

export default function RazorpayModal({ isOpen, amount, onSuccess, onCancel }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('321');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_order_id: `order_sim_${Date.now()}`,
        razorpay_signature: `sig_verified_${Math.random().toString(36).substring(7)}`
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-white">Razorpay</span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded uppercase">
                Sandbox Mode
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
              Secured with 256-bit bank-grade encryption
            </p>
          </div>

          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Price Banner */}
        <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[11px] text-gray-500 font-medium">Paying to Tez Thaila E-Commerce</p>
            <p className="text-xs font-bold text-gray-800">Order Settlement</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-brand-800">₹{amount}</span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Choose Payment Mode</p>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'card', label: 'Cards', icon: CreditCard },
              { id: 'netbanking', label: 'NetBanking', icon: Building2 },
              { id: 'wallet', label: 'Wallets', icon: Wallet },
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    selectedMethod === method.id
                      ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-xs'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1 text-sky-600" />
                  <span className="text-[10px] leading-tight">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {selectedMethod === 'upi' && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-gray-700">Enter Virtual Payment Address (UPI ID)</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-sky-500"
                placeholder="example@upi"
              />
              <div className="flex gap-2">
                {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setUpiId(`user@${app.toLowerCase().replace(' ', '')}`)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-sky-50 text-gray-700 text-[10px] font-semibold rounded-lg border border-gray-200"
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'netbanking' && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                <button
                  key={b}
                  type="button"
                  className="p-2.5 text-xs text-left border border-gray-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 text-gray-800 font-medium"
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {selectedMethod === 'wallet' && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {['Amazon Pay', 'Paytm Wallet', 'MobiKwik', 'Freecharge'].map((w) => (
                <button
                  key={w}
                  type="button"
                  className="p-2.5 text-xs text-left border border-gray-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 text-gray-800 font-medium"
                >
                  {w}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-col space-y-2">
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full py-3 bg-[#0c2340] hover:bg-[#153a6b] text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{amount}</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-gray-400 text-center">
            Simulated Sandbox Environment • No actual money will be debited
          </p>
        </div>
      </div>
    </div>
  );
}
