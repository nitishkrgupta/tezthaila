import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Heart, 
  ShoppingBag, 
  Check, 
  Plus, 
  Minus, 
  MapPin, 
  MessageSquarePlus, 
  X,
  Sparkles
} from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  // Pincode checker state
  const [pincode, setPincode] = useState('560038');
  const [deliveryEstimate, setDeliveryEstimate] = useState('Delivery Tomorrow by 11:00 AM');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.products.getBySlug(slug);
        const prod = res.data.product;
        setProduct(prod);
        setSelectedImage(prod.images?.[0] || prod.thumbnail);
        setSelectedVariant(prod.variants?.[0] || null);
        setRelated(res.data.related || []);

        // Fetch reviews
        const reviewsRes = await api.reviews.list(prod.id);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Failed fetching product details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-64 max-w-md mx-auto bg-gray-200 rounded-3xl mb-4" />
        <div className="h-6 w-1/3 mx-auto bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/4 mx-auto bg-gray-200 rounded" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-gray-500 mb-6">The requested product could not be located in our catalog.</p>
        <Link to="/products" className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs">
          Browse All Products
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const originalPrice = product.originalPrice || currentPrice;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setDeliveryEstimate('Express Delivery in 2 Hours Available!');
      addToast('Express delivery is available at your pincode');
    } else {
      addToast('Please enter a valid 6-digit Indian PIN code', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      addToast('Please provide both a title and review comment', 'error');
      return;
    }
    try {
      const res = await api.reviews.create({
        productId: product.id,
        rating: newRating,
        title: newTitle,
        comment: newComment
      });
      setReviews((prev) => [res.data, ...prev]);
      setIsReviewModalOpen(false);
      setNewTitle('');
      setNewComment('');
      addToast('Thank you! Your verified review was added.');
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-700">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.categorySlug}`} className="hover:text-brand-700">
          {product.categorySlug?.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-bold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Hero Image */}
          <div className="relative pt-[90%] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner group">
            <img
              src={selectedImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase shadow-xs">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {product.images.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === imgUrl ? 'border-brand-600 ring-2 ring-brand-200' : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Brand & Stock status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                {product.brandName || 'Tez Thaila Fresh'}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" />
                In Stock ({product.stock} available)
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating Stars & SKU */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center bg-amber-50 border border-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-gray-500">({product.reviewsCount} customer reviews)</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400 font-mono">SKU: {product.sku}</span>
            </div>

            {/* Price section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-gray-900">₹{currentPrice}</span>
                {originalPrice > currentPrice && (
                  <span className="text-base text-gray-400 line-through">MRP ₹{originalPrice}</span>
                )}
                {product.discountPercentage > 0 && (
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save ₹{originalPrice - currentPrice} ({product.discountPercentage}% OFF)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">Inclusive of all Indian taxes</p>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Select {product.variants[0].name}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-200'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                      }`}
                    >
                      <span>{v.value}</span>
                      <span className="ml-2 font-normal text-gray-500">₹{v.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div className="flex items-center space-x-4 pt-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity:</span>
              <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-gray-700 shadow-xs hover:bg-gray-50"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-gray-900 w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-gray-700 shadow-xs hover:bg-gray-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pincode checker */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-800">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Delivery Options &amp; Express Availability</span>
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-brand-500 max-w-[140px]"
                  placeholder="PIN code"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl"
                >
                  Check
                </button>
              </form>
              <p className="text-[11px] text-emerald-700 font-semibold">{deliveryEstimate}</p>
            </div>
          </div>

          {/* Action CTAs: Add to Cart, Buy Now, Wishlist */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 min-w-[140px] py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 transition-all hover:scale-101"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 min-w-[140px] py-3.5 bg-accent-500 hover:bg-accent-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-accent-500/20 transition-all hover:scale-101"
            >
              Buy Now
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-xl border transition-colors ${
                isWishlisted
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-rose-500'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Description & Specifications */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
        <h3 className="text-lg font-black text-gray-900 pb-3 border-b border-gray-100">
          Product Details &amp; Highlights
        </h3>
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-3xl">
          {product.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-0.5">Brand Name</span>
            <span className="font-bold text-gray-900">{product.brandName || 'Tez Thaila Essentials'}</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-0.5">Country of Origin</span>
            <span className="font-bold text-gray-900">India 🇮🇳</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-400 block mb-0.5">Category</span>
            <span className="font-bold text-gray-900">{product.categorySlug?.replace('-', ' ').toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-black text-gray-900 flex items-center">
              <span>Customer Ratings &amp; Reviews</span>
              <span className="ml-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {reviews.length} reviews
              </span>
            </h3>
            <p className="text-xs text-gray-500">From verified purchasers</p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4">No reviews yet for this product. Be the first to share your experience!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900">{rev.userName}</span>
                    {rev.verified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-sm">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400">{rev.date}</span>
                </div>

                <div className="flex text-amber-400 space-x-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <h4 className="text-xs font-bold text-gray-900">{rev.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Write a Product Review</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Your Rating:</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-1.5 rounded-lg border ${
                        newRating >= star ? 'text-amber-500 bg-amber-50 border-amber-200' : 'text-gray-300 border-gray-200'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Review Headline:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Delicious aroma &amp; fast delivery"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Detailed Feedback:</label>
                <textarea
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details about quality, packaging, freshness, etc."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Products Carousel */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
