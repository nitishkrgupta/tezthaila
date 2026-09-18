import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  DEMO_USERS,
  INITIAL_ADDRESSES,
  INITIAL_ORDERS,
  INITIAL_REVIEWS
} from './mockData';

// Simulated delay helper
const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

// LocalStorage helpers
const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed saving to localStorage', e);
  }
};

// Initialize default state if not already initialized
export const initMockStorage = () => {
  if (!localStorage.getItem('tez_mock_initialized')) {
    setStored('tez_mock_categories', INITIAL_CATEGORIES);
    setStored('tez_mock_brands', INITIAL_BRANDS);
    setStored('tez_mock_products', INITIAL_PRODUCTS);
    setStored('tez_mock_coupons', INITIAL_COUPONS);
    setStored('tez_mock_users', [
      { ...DEMO_USERS.admin, password: 'Admin@123' },
      { ...DEMO_USERS.customer, password: 'Customer@123' }
    ]);
    setStored('tez_mock_addresses', INITIAL_ADDRESSES);
    setStored('tez_mock_orders', INITIAL_ORDERS);
    setStored('tez_mock_reviews', INITIAL_REVIEWS);
    setStored('tez_mock_cart', []);
    setStored('tez_mock_wishlist', [1, 3]);
    localStorage.setItem('tez_mock_initialized', 'true');
  }
};

// Run initialization immediately
initMockStorage();

// Current logged in user token/session helper
const getCurrentUser = () => {
  const token = localStorage.getItem('tez_token');
  if (!token) return null;
  const users = getStored('tez_mock_users', []);
  const userId = parseInt(localStorage.getItem('tez_user_id') || '0', 10);
  return users.find((u) => u.id === userId) || null;
};

export const mockApi = {
  // ================= AUTHENTICATION =================
  async login(email, password) {
    await delay();
    const users = getStored('tez_mock_users', []);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password. Please try again.');
    }

    const token = `mock_jwt_token_${user.id}_${Date.now()}`;
    localStorage.setItem('tez_token', token);
    localStorage.setItem('tez_user_id', user.id.toString());

    const { password: _, ...userData } = user;
    return {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: userData,
        token
      }
    };
  },

  async register({ name, email, phone, password }) {
    await delay();
    const users = getStored('tez_mock_users', []);
    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: Date.now(),
      name,
      email: email.trim(),
      phone: phone || '+91 98000 00000',
      password,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
    };

    users.push(newUser);
    setStored('tez_mock_users', users);

    const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem('tez_token', token);
    localStorage.setItem('tez_user_id', newUser.id.toString());

    const { password: _, ...userData } = newUser;
    return {
      success: true,
      message: 'Account registered successfully',
      data: {
        user: userData,
        token
      }
    };
  },

  async getMe() {
    await delay(100);
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    const { password: _, ...userData } = user;
    return {
      success: true,
      data: { user: userData }
    };
  },

  async logout() {
    await delay(100);
    localStorage.removeItem('tez_token');
    localStorage.removeItem('tez_user_id');
    return { success: true, message: 'Logged out successfully' };
  },

  async updateProfile(updates) {
    await delay();
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');

    const users = getStored('tez_mock_users', []);
    const index = users.findIndex((u) => u.id === currentUser.id);
    if (index === -1) throw new Error('User not found');

    users[index] = { ...users[index], ...updates };
    setStored('tez_mock_users', users);

    const { password: _, ...userData } = users[index];
    return { success: true, message: 'Profile updated', data: { user: userData } };
  },

  // ================= PRODUCTS =================
  async getProducts(params = {}) {
    await delay(150);
    let products = getStored('tez_mock_products', INITIAL_PRODUCTS);

    const {
      q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      sort,
      featured,
      bestseller,
      page = 1,
      limit = 24
    } = params;

    // Search filter
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.brandName && p.brandName.toLowerCase().includes(term)) ||
          p.sku.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (category) {
      products = products.filter((p) => p.categorySlug === category);
    }

    // Brand filter
    if (brand) {
      const brandsList = Array.isArray(brand) ? brand : [brand];
      products = products.filter((p) => brandsList.includes(p.brandName));
    }

    // Price range
    if (minPrice !== undefined && minPrice !== '') {
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    // Rating
    if (minRating !== undefined && minRating !== '') {
      products = products.filter((p) => p.rating >= Number(minRating));
    }

    // Discount
    if (minDiscount !== undefined && minDiscount !== '') {
      products = products.filter((p) => p.discountPercentage >= Number(minDiscount));
    }

    // Featured / Bestseller
    if (featured === true || featured === 'true') {
      products = products.filter((p) => p.featured);
    }
    if (bestseller === true || bestseller === 'true') {
      products = products.filter((p) => p.bestseller);
    }

    // Sorting
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'discount') {
      products.sort((a, b) => b.discountPercentage - a.discountPercentage);
    } else if (sort === 'newest') {
      products.sort((a, b) => b.id - a.id);
    } else {
      // Default: popularity / rating * reviews
      products.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        products: paginatedProducts,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getProductBySlug(slug) {
    await delay(120);
    const products = getStored('tez_mock_products', INITIAL_PRODUCTS);
    const product = products.find((p) => p.slug === slug);
    if (!product) throw new Error('Product not found');

    const related = products
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);

    return {
      success: true,
      data: {
        product,
        related
      }
    };
  },

  // ================= CATEGORIES & BRANDS =================
  async getCategories() {
    await delay(100);
    return {
      success: true,
      data: getStored('tez_mock_categories', INITIAL_CATEGORIES)
    };
  },

  async getBrands() {
    await delay(100);
    return {
      success: true,
      data: getStored('tez_mock_brands', INITIAL_BRANDS)
    };
  },

  // ================= CART =================
  async getCart() {
    await delay(100);
    const cart = getStored('tez_mock_cart', []);
    return {
      success: true,
      data: cart
    };
  },

  async addToCart({ product, variant, quantity = 1 }) {
    await delay(150);
    const cart = getStored('tez_mock_cart', []);
    const existingIndex = cart.findIndex(
      (item) => item.productId === product.id && item.variantId === (variant?.id || null)
    );

    const price = variant ? variant.price : product.price;

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].subtotal = cart[existingIndex].quantity * price;
    } else {
      cart.push({
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        thumbnail: product.thumbnail,
        variantId: variant?.id || null,
        variantName: variant ? `${variant.name}: ${variant.value}` : null,
        price,
        originalPrice: product.originalPrice || price,
        quantity,
        subtotal: quantity * price,
        stock: variant ? variant.stock : product.stock
      });
    }

    setStored('tez_mock_cart', cart);
    return { success: true, message: 'Product added to cart', data: cart };
  },

  async updateCartItem(itemId, quantity) {
    await delay(100);
    let cart = getStored('tez_mock_cart', []);
    if (quantity <= 0) {
      cart = cart.filter((item) => item.id !== itemId);
    } else {
      cart = cart.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            subtotal: quantity * item.price
          };
        }
        return item;
      });
    }
    setStored('tez_mock_cart', cart);
    return { success: true, data: cart };
  },

  async removeFromCart(itemId) {
    await delay(100);
    let cart = getStored('tez_mock_cart', []);
    cart = cart.filter((item) => item.id !== itemId);
    setStored('tez_mock_cart', cart);
    return { success: true, message: 'Item removed from cart', data: cart };
  },

  async clearCart() {
    await delay(50);
    setStored('tez_mock_cart', []);
    return { success: true };
  },

  // ================= WISHLIST =================
  async getWishlist() {
    await delay(100);
    const wishlistIds = getStored('tez_mock_wishlist', []);
    const products = getStored('tez_mock_products', INITIAL_PRODUCTS);
    const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));
    return {
      success: true,
      data: wishlistProducts
    };
  },

  async toggleWishlist(productId) {
    await delay(100);
    let wishlist = getStored('tez_mock_wishlist', []);
    let isAdded = false;

    if (wishlist.includes(productId)) {
      wishlist = wishlist.filter((id) => id !== productId);
      isAdded = false;
    } else {
      wishlist.push(productId);
      isAdded = true;
    }

    setStored('tez_mock_wishlist', wishlist);
    return {
      success: true,
      isAdded,
      message: isAdded ? 'Added to Wishlist' : 'Removed from Wishlist',
      data: wishlist
    };
  },

  // ================= COUPONS =================
  async validateCoupon(code, subtotal) {
    await delay(150);
    const coupons = getStored('tez_mock_coupons', INITIAL_COUPONS);
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );

    if (!coupon) {
      throw new Error('Invalid coupon code. Try WELCOME10 or SAVE500');
    }

    if (subtotal < coupon.minimumOrderAmount) {
      throw new Error(`Minimum order of ₹${coupon.minimumOrderAmount} required for this coupon`);
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return {
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      data: {
        code: coupon.code,
        discount,
        coupon
      }
    };
  },

  // ================= ADDRESSES =================
  async getAddresses() {
    await delay(100);
    const addresses = getStored('tez_mock_addresses', INITIAL_ADDRESSES);
    return { success: true, data: addresses };
  },

  async addAddress(addressData) {
    await delay(150);
    const addresses = getStored('tez_mock_addresses', INITIAL_ADDRESSES);
    const newAddress = {
      id: Date.now(),
      userId: 2,
      ...addressData,
      isDefault: addresses.length === 0 || addressData.isDefault
    };

    if (newAddress.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses.push(newAddress);
    setStored('tez_mock_addresses', addresses);
    return { success: true, message: 'Address saved', data: newAddress };
  },

  async deleteAddress(id) {
    await delay(100);
    let addresses = getStored('tez_mock_addresses', INITIAL_ADDRESSES);
    addresses = addresses.filter((a) => a.id !== id);
    setStored('tez_mock_addresses', addresses);
    return { success: true, message: 'Address deleted' };
  },

  // ================= ORDERS & CHECKOUT =================
  async createOrder({ addressId, paymentMethod, couponCode, items, subtotal, discount, shippingFee, tax, totalAmount }) {
    await delay(300);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    const addresses = getStored('tez_mock_addresses', INITIAL_ADDRESSES);
    const address = addresses.find((a) => a.id === addressId) || addresses[0];

    const orderNumber = `TT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderNumber,
      orderNumber,
      userId: 2,
      createdAt: new Date().toISOString(),
      orderStatus: 'ORDER_PLACED',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      subtotal,
      discount: discount || 0,
      shippingFee: shippingFee || 0,
      tax: tax || 0,
      totalAmount,
      couponCode: couponCode || null,
      trackingNumber: `TT-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
      estimatedDelivery: new Date(Date.now() + 86400000 * 2).toISOString(),
      address,
      items
    };

    orders.unshift(newOrder);
    setStored('tez_mock_orders', orders);

    // Clear cart after successful checkout
    setStored('tez_mock_cart', []);

    return {
      success: true,
      message: 'Order placed successfully!',
      data: newOrder
    };
  },

  async getOrders() {
    await delay(150);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    return { success: true, data: orders };
  },

  async getOrderById(orderId) {
    await delay(100);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    const order = orders.find((o) => o.orderNumber === orderId || o.id === orderId);
    if (!order) throw new Error('Order not found');
    return { success: true, data: order };
  },

  async cancelOrder(orderId, reason = 'Customer cancelled') {
    await delay(200);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.orderNumber === orderId || o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    if (orders[index].orderStatus === 'DELIVERED') {
      throw new Error('Delivered orders cannot be cancelled. You may request a return instead.');
    }

    orders[index].orderStatus = 'CANCELLED';
    orders[index].cancelReason = reason;
    setStored('tez_mock_orders', orders);

    return { success: true, message: 'Order cancelled successfully', data: orders[index] };
  },

  async requestReturn(orderId, reason) {
    await delay(200);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.orderNumber === orderId || o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].orderStatus = 'RETURN_REQUESTED';
    orders[index].returnReason = reason;
    setStored('tez_mock_orders', orders);

    return { success: true, message: 'Return requested successfully. Pickup scheduled within 48h.', data: orders[index] };
  },

  // ================= SIMULATED RAZORPAY =================
  async createRazorpayOrder({ amount, currency = 'INR' }) {
    await delay(200);
    const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    return {
      success: true,
      data: {
        id: razorpayOrderId,
        amount: amount * 100, // in paise
        currency,
        key: 'rzp_test_simulated_key'
      }
    };
  },

  async verifyRazorpayPayment({ razorpay_order_id, razorpay_payment_id }) {
    await delay(250);
    return {
      success: true,
      message: 'Razorpay payment signature verified successfully',
      data: {
        paymentId: razorpay_payment_id || `pay_${Date.now()}`,
        status: 'PAID'
      }
    };
  },

  // ================= REVIEWS =================
  async getProductReviews(productId) {
    await delay(100);
    const reviews = getStored('tez_mock_reviews', INITIAL_REVIEWS);
    const filtered = reviews.filter((r) => r.productId === Number(productId));
    return { success: true, data: filtered };
  },

  async addReview({ productId, rating, title, comment }) {
    await delay(150);
    const currentUser = getCurrentUser() || DEMO_USERS.customer;
    const reviews = getStored('tez_mock_reviews', INITIAL_REVIEWS);

    const newReview = {
      id: Date.now(),
      productId: Number(productId),
      userName: currentUser.name,
      rating: Number(rating),
      title,
      comment,
      date: 'Just now',
      verified: true
    };

    reviews.unshift(newReview);
    setStored('tez_mock_reviews', reviews);
    return { success: true, message: 'Review submitted successfully!', data: newReview };
  },

  // ================= ADMIN MANAGEMENT =================
  async getAdminStats() {
    await delay(150);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    const products = getStored('tez_mock_products', INITIAL_PRODUCTS);
    const users = getStored('tez_mock_users', []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const lowStockCount = products.filter((p) => p.stock < 40).length;
    const pendingOrdersCount = orders.filter((o) => ['ORDER_PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED'].includes(o.orderStatus)).length;

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers: users.filter((u) => u.role === 'CUSTOMER').length + 42,
        totalProducts: products.length,
        pendingOrders: pendingOrdersCount,
        lowStockItems: lowStockCount,
        recentOrders: orders.slice(0, 5)
      }
    };
  },

  async updateOrderStatus(orderId, newStatus) {
    await delay(150);
    const orders = getStored('tez_mock_orders', INITIAL_ORDERS);
    const index = orders.findIndex((o) => o.orderNumber === orderId || o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    orders[index].orderStatus = newStatus;
    if (newStatus === 'DELIVERED') {
      orders[index].paymentStatus = 'PAID';
    }
    setStored('tez_mock_orders', orders);

    return { success: true, message: `Order status updated to ${newStatus}`, data: orders[index] };
  },

  async addProduct(productData) {
    await delay(200);
    const products = getStored('tez_mock_products', INITIAL_PRODUCTS);
    
    const category = INITIAL_CATEGORIES.find(
      (c) => c.id === Number(productData.categoryId) || c.slug === productData.categorySlug
    ) || INITIAL_CATEGORIES[0];

    const price = Number(productData.price) || 99;
    const originalPrice = Number(productData.originalPrice) || price;
    const discountPercentage = originalPrice > price 
      ? Math.round(((originalPrice - price) / originalPrice) * 100) 
      : (Number(productData.discountPercentage) || 0);

    const thumbnail = productData.thumbnail || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
    const slug = productData.slug || (productData.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const newProduct = {
      id: Date.now(),
      name: productData.name,
      slug: uniqueSlug,
      sku: productData.sku || `TT-${Date.now().toString().slice(-6)}`,
      description: productData.description || 'Authentic quality product from Tez Thaila.',
      price,
      originalPrice,
      discountPercentage,
      stock: Number(productData.stock) || 50,
      categoryId: category.id,
      categorySlug: category.slug,
      category: { id: category.id, name: category.name, slug: category.slug },
      brandName: productData.brandName || 'Tez Brand',
      brand: { name: productData.brandName || 'Tez Brand', slug: (productData.brandName || 'tez').toLowerCase() },
      thumbnail,
      images: productData.images?.length ? productData.images : [thumbnail],
      rating: 4.5,
      reviewsCount: 1,
      featured: Boolean(productData.featured),
      bestseller: Boolean(productData.bestseller),
      active: true,
      variants: productData.variants?.length ? productData.variants : [
        {
          id: 1,
          productId: Date.now(),
          name: 'Pack Size',
          value: 'Standard Pack',
          price,
          stock: Number(productData.stock) || 50
        }
      ],
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    setStored('tez_mock_products', products);
    return { success: true, message: 'Product created successfully', data: newProduct };
  },

  async updateProductStock(productId, newStock) {
    await delay(100);
    const products = getStored('tez_mock_products', INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === productId);
    if (index > -1) {
      products[index].stock = Number(newStock);
      setStored('tez_mock_products', products);
    }
    return { success: true, message: 'Stock updated' };
  }
};
