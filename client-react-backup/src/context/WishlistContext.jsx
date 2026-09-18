import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadWishlist = async () => {
    try {
      const res = await api.wishlist.get();
      setWishlist(res.data || []);
    } catch (err) {
      console.error('Failed loading wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product) => {
    try {
      const res = await api.wishlist.toggle(product.id);
      if (res.isAdded) {
        setWishlist((prev) => [...prev, product]);
        addToast(`'${product.name.substring(0, 30)}...' added to Wishlist`);
      } else {
        setWishlist((prev) => prev.filter((item) => item.id !== product.id));
        addToast(`Removed from Wishlist`);
      }
    } catch (err) {
      addToast(err.message || 'Wishlist update failed', 'error');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isInWishlist,
        toggleWishlist,
        wishlistCount: wishlist.length,
        refreshWishlist: loadWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
