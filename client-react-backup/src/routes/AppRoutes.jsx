import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/customer/HomePage';
import ProductListingPage from '../pages/customer/ProductListingPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderSuccessPage from '../pages/customer/OrderSuccessPage';
import OrdersPage from '../pages/customer/OrdersPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import WishlistPage from '../pages/customer/WishlistPage';
import AccountPage from '../pages/customer/AccountPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminRoute from '../components/admin/AdminRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Customer Storefront Routes with MainLayout (Header, Navbar, Footer, CartDrawer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListingPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Dedicated Admin Portal Routes (Separated from Customer Storefront) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
