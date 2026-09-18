import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ArrowRight, 
  Flame, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  CheckCircle2,
  PackageOpen,
  Plus
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import api from '../../services/api';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../../services/mockData';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Countdown timer for Deals of the Day
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [prodsRes, catsRes] = await Promise.all([
          api.products.list({ limit: 40 }),
          api.categories.list()
        ]);
        setProducts(prodsRes.data?.products || []);
        if (catsRes.data?.length) {
          setCategories(catsRes.data);
        }
      } catch (err) {
        console.error('Failed fetching home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const dealProducts = products.filter((p) => p.discountPercentage >= 10);
  const bestSellers = products.filter((p) => p.bestseller || p.stock > 0);
  const featuredProducts = products.filter((p) => p.featured || p.stock > 0);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="max-w-2xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent-300 border border-white/15">
              <Zap className="w-4 h-4 text-accent-400 fill-accent-400" />
              <span>Tez Delivery • Under 2 Hours at Your Doorstep</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              India's Express <br />
              <span className="text-accent-400">Shopping Bag.</span>
            </h1>

            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-xl">
              From fresh farm vegetables, authentic atta &amp; pure cow ghee, to wireless earbuds and kitchen essentials — 
              authentic Indian brands delivered at unbeatable everyday prices.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                to="/products"
                className="px-6 py-3.5 bg-accent-500 hover:bg-accent-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-accent-500/20 flex items-center space-x-2 transition-all hover:scale-102"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/admin"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-xs transition-colors"
              >
                Admin Central
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-[11px] text-emerald-200">Genuine Brands</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">₹499+</p>
                <p className="text-[11px] text-emerald-200">Free Express Delivery</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">4.8 ★</p>
                <p className="text-[11px] text-emerald-200">Verified Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 2. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs text-gray-500">Handpicked collections for all your daily needs</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group bg-white p-3 rounded-2xl border border-gray-200/80 hover:border-brand-400 hover:shadow-md transition-all text-center flex flex-col items-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2.5 bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-bold text-gray-800 group-hover:text-brand-700 transition-colors line-clamp-2">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* EMPTY CATALOG NOTICE (If products have not been added yet) */}
      {!loading && products.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-tr from-slate-900 via-brand-950 to-slate-900 text-white p-8 sm:p-12 rounded-3xl text-center space-y-4 shadow-xl border border-brand-800/40">
            <div className="w-16 h-16 rounded-2xl bg-accent-500/20 text-accent-400 mx-auto flex items-center justify-center">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Fresh Stock Arriving Soon!</h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
              Our inventory team is currently restocking fresh daily essentials, groceries, and staples. Please check back shortly or explore our featured categories above!
            </p>
          </div>
        </section>
      )}

      {/* 3. DEALS OF THE DAY (Rendered when products exist) */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <Flame className="w-7 h-7 fill-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-widest bg-black/30 px-2.5 py-0.5 rounded-full">
                    Flash Sale
                  </span>
                  <span className="text-xs font-bold text-amber-100">Hot Everyday Offers</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  Deals of the Day
                </h3>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 self-start sm:self-auto">
              <Clock className="w-4 h-4 text-amber-300 mr-1" />
              <span className="text-xs font-bold text-amber-200">Ends in:</span>
              <div className="flex items-center space-x-1 font-mono font-black text-sm">
                <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(dealProducts.length ? dealProducts : products).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 4. PROMOTIONAL COUPON BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-brand-700/60 relative overflow-hidden shadow-lg">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="text-xs font-bold text-accent-400 uppercase tracking-wider">
              Exclusive Member Welcome Gift
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Get 10% Extra Discount On Your Order
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200">
              Apply coupon <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">WELCOME10</span> at checkout for orders above ₹499.
            </p>
          </div>

          <div className="flex items-center space-x-3 z-10">
            <Link
              to="/products"
              className="px-6 py-3 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors"
            >
              Explore Products Now
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BEST SELLERS / CATALOG HIGHLIGHTS */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center">
                <span>Featured Products in Store</span>
                <Sparkles className="w-5 h-5 ml-2 text-amber-500 fill-amber-500" />
              </h2>
              <p className="text-xs text-gray-500">Recently published products by administrator</p>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(bestSellers.length ? bestSellers : products).slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. TRUSTED INDIAN BRANDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Featured Brands on Tez Thaila</h2>
          <p className="text-xs text-gray-500">Authentic products straight from authorized brand distributors</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {INITIAL_BRANDS.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-brand-500 hover:shadow-xs transition-colors flex items-center space-x-2"
            >
              <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-cover rounded-full" />
              <span className="text-xs font-bold text-gray-800">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-100/70 rounded-3xl p-6 sm:p-10 border border-gray-200/60">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">What Our Shoppers Say</h2>
            <p className="text-xs text-gray-500 mt-1">Real reviews from verified Tez Thaila buyers across India</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ananya Deshmukh',
                city: 'Pune, Maharashtra',
                comment: 'The fastest delivery service! Ordered staples in the morning and had them in my kitchen by noon. Packaging was impeccable.',
                rating: 5
              },
              {
                name: 'Karthik Ramanathan',
                city: 'Bengaluru, Karnataka',
                comment: 'Very competitive prices compared to local supermarket. Authentic products straight from verified brands.',
                rating: 5
              },
              {
                name: 'Sunita Verma',
                city: 'Delhi NCR',
                comment: 'I love the fresh farm vegetables and unpolished dals. Very convenient checkout with express tracking.',
                rating: 5
              }
            ].map((review, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex text-amber-400 space-x-0.5">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed italic">"{review.comment}"</p>
                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-900">{review.name}</p>
                    <p className="text-[10px] text-gray-400">{review.city}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
