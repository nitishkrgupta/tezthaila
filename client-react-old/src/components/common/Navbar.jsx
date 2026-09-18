import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flame, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../services/mockData';

export default function Navbar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');

  return (
    <nav className="bg-white border-b border-gray-100 hidden sm:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-2.5 text-xs font-semibold scrollbar-none">
          <Link
            to="/products"
            className={`px-3 py-1.5 rounded-full flex items-center space-x-1 flex-shrink-0 transition-colors ${
              location.pathname === '/products' && !currentCategory
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>All Products</span>
          </Link>

          {INITIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className={`px-3 py-1.5 rounded-full flex-shrink-0 transition-colors ${
                currentCategory === cat.slug
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {cat.name}
            </Link>
          ))}

          <Link
            to="/products?featured=true"
            className="px-3 py-1.5 rounded-full flex items-center space-x-1 flex-shrink-0 text-amber-700 hover:bg-amber-50"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Hot Deals</span>
          </Link>

          <Link
            to="/products?bestseller=true"
            className="px-3 py-1.5 rounded-full flex items-center space-x-1 flex-shrink-0 text-brand-700 hover:bg-brand-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Best Sellers</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
