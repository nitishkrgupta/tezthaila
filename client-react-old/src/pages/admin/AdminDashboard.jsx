import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp,
  Search,
  Tag,
  Boxes,
  X,
  LogOut,
  Upload,
  Camera,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { INITIAL_CATEGORIES, INITIAL_BRANDS } from '../../services/mockData';

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'orders', 'products', 'customers', 'coupons'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '',
    originalPrice: '',
    discountPercentage: 10,
    stock: 50,
    categoryId: 1,
    brandName: 'Amul',
    categorySlug: 'groceries-staples',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: 'High quality authentic grocery product.'
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes, prodsRes] = await Promise.all([
        api.admin.getStats(),
        api.orders.list(),
        api.products.list({ limit: 50 })
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data || []);
      setProducts(prodsRes.data?.products || []);
    } catch (err) {
      console.error('Failed fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.admin.updateOrderStatus(orderId, newStatus);
      addToast(`Order #${orderId} marked as ${newStatus}`);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  // Remove Product state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Image Upload & Camera States
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [useUrlFallback, setUseUrlFallback] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImagePreview(uploadEvent.target?.result);
    };
    reader.readAsDataURL(file);

    setImageUploadLoading(true);
    try {
      const res = await api.upload.image(file);
      const uploadedUrl = res.data?.url;
      setNewProd((prev) => ({ ...prev, thumbnail: uploadedUrl }));
      addToast('Product image uploaded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Webcam stream error, falling back to native camera input:', err);
      setIsCameraActive(false);
      // If getUserMedia fails or is blocked, trigger native file input with camera capture
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      } else {
        addToast('Camera unavailable: ' + (err.message || 'Permission denied'), 'warning');
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setImagePreview(dataUrl);
    stopCamera();

    // Upload base64 photo to server
    setImageUploadLoading(true);
    try {
      const res = await api.upload.image(dataUrl);
      const uploadedUrl = res.data?.url;
      setNewProd((prev) => ({ ...prev, thumbnail: uploadedUrl }));
      addToast('Camera photo captured and uploaded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed saving captured photo', 'error');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!product) return;
    setDeleting(true);
    try {
      await api.products.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      addToast(`Product "${product.name}" removed successfully!`, 'success');
      setProductToDelete(null);
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to remove product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleStockAdjust = async (productId, currentStock, delta) => {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      await api.products.updateStock(productId, nextStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: nextStock } : p))
      );
      addToast('Inventory stock updated');
    } catch (err) {
      addToast('Stock update failed', 'error');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProd.thumbnail) {
      addToast('Please upload or capture a product image', 'error');
      return;
    }

    try {
      const price = Number(newProd.price);
      const originalPrice = Number(newProd.originalPrice || price);
      const discountPercentage = originalPrice > price 
        ? Math.round(((originalPrice - price) / originalPrice) * 100) 
        : 0;

      const payload = {
        ...newProd,
        slug: (newProd.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: newProd.sku || `TT-${Date.now().toString().slice(-6)}`,
        price,
        originalPrice,
        discountPercentage,
        stock: Number(newProd.stock) || 50
      };
      await api.products.create(payload);
      setIsAddProductModalOpen(false);
      setImagePreview('');
      setUseUrlFallback(false);
      stopCamera();
      setNewProd({
        name: '',
        slug: '',
        sku: '',
        price: '',
        originalPrice: '',
        discountPercentage: 10,
        stock: 50,
        categoryId: 1,
        brandName: 'Amul',
        categorySlug: 'groceries-staples',
        thumbnail: '',
        description: 'High quality authentic grocery product.'
      });
      addToast('New product added to catalog successfully!');
      loadAdminData();
    } catch (err) {
      addToast(err.message || 'Failed creating product', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-accent-500 text-slate-950 flex items-center justify-center font-black">
              TT
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-tight text-white">TEZ THAILA</span>
                <span className="text-[10px] font-bold bg-accent-500 text-slate-900 px-2 py-0.5 rounded-full uppercase">
                  Admin Central
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Operations &amp; Analytics Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Storefront</span>
            </Link>

            <button
              onClick={async () => {
                await logout();
                navigate('/admin/login');
              }}
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 text-xs font-bold scrollbar-none">
          {[
            { id: 'dashboard', label: 'Overview & KPI Analytics', icon: BarChart3 },
            { id: 'orders', label: `Manage Orders (${orders.length})`, icon: Package },
            { id: 'products', label: `Products & Stock (${products.length})`, icon: Boxes },
            { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
            { id: 'customers', label: 'Customers', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-brand-800 text-white shadow-md shadow-brand-900/20'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW / DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900">₹{stats?.totalRevenue?.toLocaleString('en-IN') || '2,173'}</h3>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18.4% this week</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900">{stats?.totalOrders || orders.length}</h3>
                <p className="text-[11px] text-blue-600 font-semibold mt-1">{stats?.pendingOrders || 1} active in transit</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Catalog Products</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900">{products.length}</h3>
                <p className="text-[11px] text-purple-600 font-semibold mt-1">8 Active Categories</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Low Stock Alert</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900">{stats?.lowStockItems || 2}</h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">Requires replenishment</p>
              </div>
            </div>

            {/* Recent Orders in Dashboard */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Recent Customer Orders</h3>
                  <p className="text-xs text-gray-500">Live feed of orders placed through customer checkout</p>
                </div>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-brand-700 hover:text-brand-800">
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-semibold uppercase text-[10px]">
                      <th className="py-2.5">Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/60">
                        <td className="py-3 font-mono font-bold text-brand-800">{o.orderNumber}</td>
                        <td className="text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="font-bold text-gray-900">₹{o.totalAmount}</td>
                        <td>
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            {o.paymentMethod}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.orderStatus === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateStatus(o.orderNumber, e.target.value)}
                            className="text-[11px] font-semibold border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:border-brand-500"
                          >
                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">Customer Orders Management</h3>
                <p className="text-xs text-gray-500">Update fulfillment lifecycle (changes reflect on customer tracking timeline instantly!)</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-3">Order Number</th>
                    <th>Customer Details</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Tracking Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="py-3.5 font-mono font-bold text-brand-800">{o.orderNumber}</td>
                      <td>
                        <p className="font-bold text-gray-800">{o.address?.fullName || 'Rahul Sharma'}</p>
                        <p className="text-[11px] text-gray-400">{o.address?.city} • {o.address?.phone}</p>
                      </td>
                      <td className="text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td className="font-extrabold text-gray-900">₹{o.totalAmount}</td>
                      <td>
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded mr-1">
                          {o.paymentMethod}
                        </span>
                        <span className={`text-[10px] font-bold ${o.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          o.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.orderStatus === 'CANCELLED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateStatus(o.orderNumber, e.target.value)}
                          className="text-xs font-bold border border-gray-300 rounded-xl px-2.5 py-1.5 bg-white shadow-xs focus:border-brand-500"
                        >
                          <option value="ORDER_PLACED">ORDER_PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PACKED">PACKED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PRODUCTS & INVENTORY TAB */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">Products Catalog &amp; Inventory</h3>
                <p className="text-xs text-gray-500">Monitor stock levels, replenish units, or publish new products</p>
              </div>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-3">Product</th>
                    <th>SKU</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock Units</th>
                    <th>Inventory Status</th>
                    <th>Adjust Stock</th>
                    <th className="text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const status =
                      p.stock === 0
                        ? 'OUT_OF_STOCK'
                        : p.stock < 35
                        ? 'LOW_STOCK'
                        : 'IN_STOCK';

                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-3 flex items-center space-x-3">
                          <img src={p.thumbnail} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                          <span className="font-bold text-gray-900 max-w-xs truncate">{p.name}</span>
                        </td>
                        <td className="font-mono text-gray-500">{p.sku}</td>
                        <td className="font-semibold text-brand-700">{p.brandName || 'Tez Brand'}</td>
                        <td className="font-extrabold text-gray-900">₹{p.price}</td>
                        <td className="font-bold text-gray-800">{p.stock} units</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'IN_STOCK'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'LOW_STOCK'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleStockAdjust(p.id, p.stock, -10)}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-bold flex items-center justify-center"
                              title="-10 units"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleStockAdjust(p.id, p.stock, 25)}
                              className="w-6 h-6 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded font-bold flex items-center justify-center"
                              title="+25 units"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-right pr-2">
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors"
                            title={`Remove ${p.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              Active Store Coupons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { code: 'WELCOME10', type: '10% OFF', min: '₹499', max: '₹150', status: 'Active' },
                { code: 'FIRSTORDER', type: '₹100 Flat', min: '₹399', max: '₹100', status: 'Active' },
                { code: 'SAVE500', type: '₹500 Flat', min: '₹2,499', max: '₹500', status: 'Active' },
                { code: 'FESTIVE20', type: '20% OFF', min: '₹999', max: '₹300', status: 'Active' }
              ].map((c) => (
                <div key={c.code} className="p-4 rounded-2xl bg-brand-50/50 border border-brand-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-brand-800 text-sm">{c.code}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {c.status}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800">{c.type}</p>
                  <p className="text-[11px] text-gray-500">Min Order: {c.min} • Cap: {c.max}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
              Customer Accounts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                    <th className="py-3">Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 font-bold text-gray-900">Rahul Sharma</td>
                    <td className="text-gray-600">customer@tezthaila.com</td>
                    <td className="text-gray-600">+91 98765 43211</td>
                    <td><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">CUSTOMER</span></td>
                    <td><span className="text-emerald-700 font-bold">Active</span></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-3 font-bold text-gray-900">Tez Admin</td>
                    <td className="text-gray-600">admin@tezthaila.com</td>
                    <td className="text-gray-600">+91 98765 43210</td>
                    <td><span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">ADMIN</span></td>
                    <td><span className="text-emerald-700 font-bold">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Add New Product to Catalog</h3>
              <button onClick={() => setIsAddProductModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Organic Brown Basmati Rice (1kg)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={newProd.categorySlug}
                    onChange={(e) => {
                      const selectedCat = INITIAL_CATEGORIES.find((c) => c.slug === e.target.value);
                      setNewProd({
                        ...newProd,
                        categorySlug: e.target.value,
                        categoryId: selectedCat ? selectedCat.id : 1
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    {INITIAL_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={newProd.brandName}
                    onChange={(e) => setNewProd({ ...newProd, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Product Image Upload / Camera Picker */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-bold text-gray-700 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-600" />
                    <span>Product Image</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseUrlFallback(!useUrlFallback)}
                    className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    {useUrlFallback ? '← Upload / Camera' : 'Use Image URL instead'}
                  </button>
                </div>

                {useUrlFallback ? (
                  <div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newProd.thumbnail}
                      onChange={(e) => {
                        setNewProd({ ...newProd, thumbnail: e.target.value });
                        setImagePreview(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Hidden inputs for File and Camera */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    {imagePreview || newProd.thumbnail ? (
                      <div className="relative border-2 border-dashed border-emerald-300 bg-emerald-50/30 rounded-2xl p-3 flex items-center space-x-4">
                        <img
                          src={imagePreview || newProd.thumbnail}
                          alt="Product Preview"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-emerald-200 shadow-sm flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Image Attached</span>
                          </span>
                          <p className="text-[11px] text-gray-500 truncate">Ready for catalog publication</p>
                          <div className="flex space-x-3 pt-1">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[11px] font-bold text-brand-700 hover:text-brand-800 underline"
                            >
                              Browse New
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="text-[11px] font-bold text-brand-700 hover:text-brand-800 underline"
                            >
                              Snap New
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview('');
                                setNewProd((prev) => ({ ...prev, thumbnail: '' }));
                              }}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-5 text-center space-y-3 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        {imageUploadLoading ? (
                          <div className="py-4 flex flex-col items-center justify-center space-y-2 text-brand-600">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-xs font-bold text-gray-700">Uploading product image...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">Select Product Image</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">Upload a photo from your device or capture using camera</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3.5 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                              >
                                <Upload className="w-3.5 h-3.5 text-brand-600" />
                                <span>Browse Device</span>
                              </button>
                              <button
                                type="button"
                                onClick={startCamera}
                                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Take Photo</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProductModalOpen(false);
                    stopCamera();
                    setImagePreview('');
                    setUseUrlFallback(false);
                  }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={imageUploadLoading}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {imageUploadLoading ? 'Uploading Image...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-accent-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product Photo Camera</h4>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-72 flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-4 border border-white/20 rounded-xl pointer-events-none" />
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={stopCamera}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-2.5 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-accent-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Capture &amp; Use</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-gray-900">Remove Product?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-gray-900 font-bold">"{productToDelete.name}"</strong> from the catalog?
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteProduct(productToDelete)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
              >
                {deleting ? (
                  <span>Removing...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
