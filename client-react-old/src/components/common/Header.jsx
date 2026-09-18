import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  User, 
  Heart, 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown, 
  Package, 
  LogOut, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';
import { INITIAL_CATEGORIES } from '../../services/mockData';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Indiranagar, Bengaluru');
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Debounced live suggestions from MySQL
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.products.list({ q: searchQuery.trim(), limit: 5 });
        setSuggestions(res.data?.products || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (product) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/product/${product.slug}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* Top micro bar */}
      <div className="bg-brand-900 text-white text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>Free Express Delivery on orders above ₹499</span>
            </span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-300 font-medium">100% Genuine &amp; Farm Fresh</span>
          </div>
          <div className="flex items-center space-x-4 text-emerald-100/80">
            <Link to="/orders" className="hover:text-white transition-colors">Track Order</Link>
            <span>•</span>
            <Link to="/products?category=groceries-staples" className="hover:text-white transition-colors">Special Deals</Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 md:gap-6">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-brand-700 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl sm:text-2xl font-black text-brand-800 tracking-tight">TEZ</span>
                <span className="text-2xl sm:text-2xl font-black text-accent-600 tracking-tight">THAILA</span>
              </div>
              <p className="hidden sm:block text-[9px] text-gray-500 font-bold tracking-widest uppercase -mt-1">
                Express Shopping
              </p>
            </div>
          </Link>

          {/* Location Delivery Selector (Desktop) */}
          <button
            onClick={() => setIsCityModalOpen(true)}
            className="hidden lg:flex items-center space-x-2 text-left p-1.5 px-3 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors max-w-[200px]"
          >
            <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-500 font-semibold uppercase leading-tight">Deliver to</p>
              <p className="text-xs font-bold text-gray-900 truncate flex items-center">
                <span>{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-400 flex-shrink-0" />
              </p>
            </div>
          </button>

          {/* Prominent Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search atta, dal, oil, amul ghee, boat earbuds..."
                className="w-full pl-10 pr-24 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-50 focus:bg-white text-sm text-gray-900 rounded-full border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm transition-colors"
              >
                Search
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-2 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">
                  Matching Products
                </div>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectSuggestion(p)}
                    className="flex items-center space-x-3 px-3 py-2.5 hover:bg-brand-50/60 cursor-pointer transition-colors"
                  >
                    <img src={p.thumbnail} alt={p.name} className="w-9 h-9 object-cover rounded-lg border border-gray-200" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500">{p.brandName} • ₹{p.price}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ₹{p.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons: User Account, Wishlist, Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Dropdown */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 px-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-brand-300"
                  />
                  <span className="hidden md:block text-xs font-bold text-gray-800 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 p-2 px-3.5 rounded-xl text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-brand-50 hover:text-brand-800"
                    >
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      My Profile &amp; Addresses
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-brand-50 hover:text-brand-800"
                    >
                      <Package className="w-4 h-4 mr-2 text-gray-400" />
                      Orders &amp; Tracking
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-brand-50 hover:text-brand-800"
                    >
                      <Heart className="w-4 h-4 mr-2 text-gray-400" />
                      Wishlist ({wishlistCount})
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout('/');
                      }}
                      className="flex items-center w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-gray-700 hover:text-brand-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white p-2.5 sm:px-4 rounded-xl font-bold shadow-md shadow-brand-600/20 transition-all hover:scale-102"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs">Cart</span>
              {cartCount > 0 && (
                <span className="bg-accent-400 text-slate-950 text-[11px] font-black px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center">
                <MapPin className="w-5 h-5 text-brand-600 mr-2" />
                Select Delivery Location
              </h3>
              <button onClick={() => setIsCityModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter your area pincode or choose your city to check delivery availability and express shipping slots.
            </p>
            <div className="space-y-2 mb-4">
              {[
                'Indiranagar, Bengaluru - 560038',
                'Koramangala, Bengaluru - 560034',
                'Whitefield, Bengaluru - 560066',
                'Connaught Place, New Delhi - 110001',
                'Bandra West, Mumbai - 400050',
                'Hitech City, Hyderabad - 500081'
              ].map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedCity(loc.split(' - ')[0]);
                    setIsCityModalOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                    selectedCity === loc.split(' - ')[0]
                      ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <div className="border-b border-gray-100 pb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {INITIAL_CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-medium text-gray-700 hover:text-brand-700 py-1"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2 pt-1 text-xs font-semibold text-gray-800">
            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="py-1">
              My Orders &amp; Tracking
            </Link>
            <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="py-1">
              My Wishlist ({wishlistCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
