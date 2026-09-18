import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const dealsFilePath = path.join(dataDir, 'deals.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const getDefaultDeals = () => ({
  title: 'Deals of the Day',
  durationHours: 12,
  endsAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
  productIds: [1, 2, 3, 4],
  isActive: true,
  updatedAt: new Date().toISOString()
});

const readDealsFile = () => {
  try {
    if (fs.existsSync(dealsFilePath)) {
      const content = fs.readFileSync(dealsFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading deals file, using defaults:', err);
  }
  const defaultData = getDefaultDeals();
  writeDealsFile(defaultData);
  return defaultData;
};

const writeDealsFile = (data) => {
  try {
    fs.writeFileSync(dealsFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing deals file:', err);
  }
};

const formatProduct = (p) => {
  const reviewCount = p.reviews?.length || 0;
  const avgRating = reviewCount > 0
    ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
    : 4.5;

  const imgUrls = p.images?.length > 0
    ? p.images.sort((a, b) => a.sortOrder - b.sortOrder).map((img) => img.url)
    : [p.thumbnail];

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    shortDescription: p.shortDescription,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice || p.price),
    discountPercentage: p.discountPercentage,
    stock: p.stock,
    maxQuantityPerOrder: p.maxQuantityPerOrder || 10,
    categoryId: p.categoryId,
    categorySlug: p.category?.slug,
    category: p.category,
    brandName: p.brand?.name || 'Tez Brand',
    brand: p.brand,
    thumbnail: p.thumbnail,
    images: imgUrls,
    rating: avgRating,
    reviewsCount: reviewCount || 12,
    featured: p.featured,
    bestseller: p.bestseller,
    active: p.active,
    variants: p.variants || []
  };
};

export const getDeals = async (req, res, next) => {
  try {
    const dealsConfig = readDealsFile();

    // If deal ended, auto-restart for configured duration so live countdown is always running
    const now = Date.now();
    if (!dealsConfig.endsAt || new Date(dealsConfig.endsAt).getTime() <= now) {
      dealsConfig.endsAt = new Date(now + (dealsConfig.durationHours || 12) * 3600 * 1000).toISOString();
      writeDealsFile(dealsConfig);
    }

    // Fetch products from database
    let products = [];
    if (dealsConfig.productIds && dealsConfig.productIds.length > 0) {
      const dbProducts = await prisma.product.findMany({
        where: {
          id: { in: dealsConfig.productIds.map(Number) },
          active: true
        },
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
          reviews: true
        }
      });
      // Maintain order of productIds
      const productMap = new Map(dbProducts.map(p => [p.id, p]));
      products = dealsConfig.productIds
        .map(id => productMap.get(Number(id)))
        .filter(Boolean)
        .map(formatProduct);
    }

    // If no products matched by ID, fallback to top discounted products
    if (products.length === 0) {
      const fallbackProds = await prisma.product.findMany({
        where: { active: true },
        include: {
          category: true,
          brand: true,
          images: true,
          variants: true,
          reviews: true
        },
        orderBy: { discountPercentage: 'desc' },
        take: 4
      });
      products = fallbackProds.map(formatProduct);
    }

    return sendSuccess(res, 200, 'Deals of the Day fetched successfully', {
      title: dealsConfig.title || 'Deals of the Day',
      durationHours: dealsConfig.durationHours || 12,
      endsAt: dealsConfig.endsAt,
      productIds: dealsConfig.productIds || [],
      isActive: dealsConfig.isActive ?? true,
      products
    });
  } catch (error) {
    next(error);
  }
};

export const updateDealsAdmin = async (req, res, next) => {
  try {
    const { title, productIds, durationHours, durationMinutes, endsAt, isActive = true } = req.body;

    const currentConfig = readDealsFile();
    let calculatedEndsAt = endsAt;

    if (durationHours !== undefined || durationMinutes !== undefined) {
      const totalHours = parseFloat(durationHours || 0);
      const totalMinutes = parseFloat(durationMinutes || 0);
      const totalMilliseconds = (totalHours * 3600 + totalMinutes * 60) * 1000;
      if (totalMilliseconds > 0) {
        calculatedEndsAt = new Date(Date.now() + totalMilliseconds).toISOString();
      }
    }

    if (!calculatedEndsAt) {
      // Default to 12 hours from now if no duration or timestamp supplied
      calculatedEndsAt = currentConfig.endsAt || new Date(Date.now() + 12 * 3600 * 1000).toISOString();
    }

    const updatedConfig = {
      title: (title || currentConfig.title || 'Deals of the Day').trim(),
      durationHours: durationHours !== undefined ? Number(durationHours) : (currentConfig.durationHours || 12),
      endsAt: calculatedEndsAt,
      productIds: Array.isArray(productIds) ? productIds.map(Number) : (currentConfig.productIds || []),
      isActive: Boolean(isActive),
      updatedAt: new Date().toISOString()
    };

    writeDealsFile(updatedConfig);

    // Fetch updated products to return
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: updatedConfig.productIds },
        active: true
      },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
        reviews: true
      }
    });

    const productMap = new Map(dbProducts.map(p => [p.id, p]));
    const products = updatedConfig.productIds
      .map(id => productMap.get(Number(id)))
      .filter(Boolean)
      .map(formatProduct);

    return sendSuccess(res, 200, 'Deals of the Day updated and timer started successfully!', {
      ...updatedConfig,
      products
    });
  } catch (error) {
    next(error);
  }
};
