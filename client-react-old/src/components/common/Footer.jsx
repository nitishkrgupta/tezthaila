import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  CreditCard, 
  Mail, 
  Phone, 
  Clock, 
  Heart,
  ChevronRight
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Express Delivery</h4>
                <p className="text-xs text-gray-400">Under 2 hours or same day</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">100% Genuine</h4>
                <p className="text-xs text-gray-400">Direct from trusted brands</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Easy Returns</h4>
                <p className="text-xs text-gray-400">Hassle-free doorstep pickup</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-900/60 border border-brand-700/50 flex items-center justify-center text-brand-400 flex-shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Safe &amp; Secure Pay</h4>
                <p className="text-xs text-gray-400">UPI, Cards &amp; Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl font-black text-white tracking-tight">TEZ</span>
                  <span className="text-xl font-black text-accent-500 tracking-tight">THAILA</span>
                </div>
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Tez Thaila is India's fast, fresh, and reliable e-commerce shopping destination. 
              From daily grocery staples, farm produce, and dairy to consumer electronics, 
              we bring authentic products right to your doorstep.
            </p>
            <div className="flex items-center space-x-3 text-xs text-gray-400">
              <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-brand-400" /> 1800-TEZ-THAILA</span>
              <span>•</span>
              <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-brand-400" /> support@tezthaila.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=groceries-staples" className="hover:text-white transition-colors">Groceries &amp; Staples</Link></li>
              <li><Link to="/products?category=dairy-breakfast" className="hover:text-white transition-colors">Dairy &amp; Breakfast</Link></li>
              <li><Link to="/products?category=fresh-fruits-vegetables" className="hover:text-white transition-colors">Fruits &amp; Vegetables</Link></li>
              <li><Link to="/products?category=snacks-beverages" className="hover:text-white transition-colors">Snacks &amp; Beverages</Link></li>
              <li><Link to="/products?category=electronics-audio" className="hover:text-white transition-colors">Electronics &amp; Audio</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Customer Care</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Your Account</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Your Wishlist</Link></li>
              <li><span className="hover:text-white cursor-pointer transition-colors">Return Policy</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Get Special Offers</h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for exclusive flash deals, discounts, and festive coupons!
            </p>
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-3 py-2 bg-slate-800 text-white text-xs rounded-lg border border-slate-700 focus:outline-none focus:border-brand-500"
              />
              <button className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal */}
      <div className="border-t border-slate-800 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Tez Thaila India Private Limited. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="text-[11px] font-semibold text-gray-400">Accepted Payments: UPI • RuPay • Visa • Mastercard • COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
