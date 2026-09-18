import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star, Sparkles, AlertCircle } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import api from '../../services/api';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../../services/mockData';

export default function ProductListingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters state
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const featuredParam = searchParams.get('featured') || '';
  const bestsellerParam = searchParams.get('bestseller') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState(brandParam);
  const [minRating, setMinRating] = useState('');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [minDiscount, setMinDiscount] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Synchronize URL parameters with filter state
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setSelectedBrand(brandParam);
  }, [categoryParam, brandParam]);

  // Fetch filtered products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.products.list({
          q: searchQuery,
          category: selectedCategory,
          brand: selectedBrand,
          maxPrice,
          minRating,
          minDiscount,
          sort: sortBy,
          featured: featuredParam,
          bestseller: bestsellerParam
        });
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Failed fetching products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    maxPrice,
    minRating,
    minDiscount,
    sortBy,
    featuredParam,
    bestsellerParam
  ]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinRating('');
    setMaxPrice(2500);
    setMinDiscount('');
    setSortBy('popularity');
    navigate('/products');
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedBrand ||
    minRating ||
    maxPrice < 2500 ||
    minDiscount ||
    searchQuery;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center">
            <span>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory
                ? INITIAL_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Category Products'
                : selectedBrand
                ? `${selectedBrand} Products`
                : 'All Products'}
            </span>
            <span className="ml-3 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {total} items
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Explore best prices, instant savings &amp; express delivery</p>
        </div>

        {/* Sorting Dropdown & Mobile Filter Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-700 shadow-xs"
          >
            <Filter className="w-4 h-4 text-brand-600" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500 shadow-xs"
            >
              <option value="popularity">Sort by: Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="discount">Highest Discount</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden md:block space-y-6 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-brand-600" />
              Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Category</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  !selectedCategory ? 'bg-brand-50 text-brand-800 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {INITIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                    selectedCategory === cat.slug
                      ? 'bg-brand-50 text-brand-800 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Brand</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedBrand('')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  !selectedBrand ? 'bg-brand-50 text-brand-800 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Brands
              </button>
              {INITIAL_BRANDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.name)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors truncate ${
                    selectedBrand === b.name
                      ? 'bg-brand-50 text-brand-800 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-bold text-brand-700">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="30"
              max="2500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>₹30</span>
              <span>₹2,500</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Customer Rating</h4>
            <div className="space-y-1">
              {['4', '3'].map((rating) => (
                <label key={rating} className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(minRating === rating ? '' : rating)}
                    className="accent-brand-600"
                  />
                  <span className="flex items-center">
                    {rating}★ &amp; above
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Discount Filter */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Minimum Discount</h4>
            <div className="space-y-1">
              {['10', '20', '30', '50'].map((disc) => (
                <label key={disc} className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="discount"
                    checked={minDiscount === disc}
                    onChange={() => setMinDiscount(minDiscount === disc ? '' : disc)}
                    className="accent-brand-600"
                  />
                  <span>{disc}% or more</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <section className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse space-y-3">
                  <div className="h-40 bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No products found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find any products matching your active filters or search terms. Try adjusting your filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MOBILE FILTER MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Filter Products</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-gray-700 mb-2">Category</p>
                <div className="flex flex-wrap gap-1.5">
                  {INITIAL_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug === selectedCategory ? '' : cat.slug)}
                      className={`px-3 py-1.5 rounded-full border ${
                        selectedCategory === cat.slug ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-700 mb-2">Max Price: ₹{maxPrice}</p>
                <input
                  type="range"
                  min="30"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
