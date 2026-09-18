import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            brand: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = items.map((w) => ({
      id: w.product.id,
      name: w.product.name,
      slug: w.product.slug,
      sku: w.product.sku,
      price: Number(w.product.price),
      originalPrice: Number(w.product.originalPrice || w.product.price),
      discountPercentage: w.product.discountPercentage,
      stock: w.product.stock,
      thumbnail: w.product.thumbnail,
      brandName: w.product.brand?.name || 'Tez Brand',
      categorySlug: w.product.category?.slug,
      rating: 4.5,
      reviewsCount: 10
    }));

    return sendSuccess(res, 200, 'Wishlist fetched successfully', formatted);
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = parseInt(req.params.productId || req.body?.productId);

    if (!productId) {
      return sendError(res, 400, 'Valid product ID is required');
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return res.status(200).json({
        success: true,
        isAdded: false,
        message: 'Removed from Wishlist'
      });
    } else {
      await prisma.wishlist.create({
        data: {
          userId,
          productId
        }
      });
      return res.status(200).json({
        success: true,
        isAdded: true,
        message: 'Added to Wishlist'
      });
    }
  } catch (error) {
    next(error);
  }
};
