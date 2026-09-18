import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadCart = async () => {
    try {
      const res = await api.cart.get();
      setCart(res.data || []);
    } catch (err) {
      console.error('Failed loading cart', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Price calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Free delivery above ₹499
  const shippingFee = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 40;
  
  // Tax: GST 5% on groceries
  const tax = Math.round(cartSubtotal * 0.05);

  let discount = 0;
  if (coupon) {
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((cartSubtotal * coupon.value) / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.value;
    }
  }

  const totalAmount = Math.max(0, cartSubtotal - discount + shippingFee + tax);

  const addToCart = async (product, variant = null, quantity = 1) => {
    try {
      const res = await api.cart.add({ product, variant, quantity });
      setCart(res.data);
      addToast(`Added '${product.name.substring(0, 25)}...' to cart`);
      setIsCartOpen(true);
    } catch (err) {
      addToast(err.message || 'Failed to add item', 'error');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.cart.update(itemId, quantity);
      setCart(res.data);
    } catch (err) {
      addToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.cart.remove(itemId);
      setCart(res.data);
      addToast('Item removed from cart');
    } catch (err) {
      addToast(err.message || 'Failed to remove item', 'error');
    }
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      addToast('Please enter a coupon code', 'error');
      return false;
    }
    try {
      const res = await api.coupons.validate(code.trim(), cartSubtotal);
      setCoupon(res.data.coupon);
      addToast(res.message);
      return true;
    } catch (err) {
      addToast(err.message || 'Invalid coupon', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast('Coupon removed');
  };

  const clearCart = async () => {
    await api.cart.clear();
    setCart([]);
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartSubtotal,
        discount,
        shippingFee,
        tax,
        totalAmount,
        coupon,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        refreshCart: loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
