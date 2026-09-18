import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId: parseInt(productId),
        isApproved: true
      },
      include: {
        user: { select: { name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      userName: r.user?.name || 'Verified Buyer',
      userAvatar: r.user?.avatar,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      date: r.createdAt.toLocaleDateString(),
      verified: r.verifiedPurchase
    }));

    return sendSuccess(res, 200, 'Product reviews fetched', formatted);
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      return sendError(res, 400, 'Product ID, rating, title, and review comment are required');
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: parseInt(productId),
        rating: parseInt(rating),
        title,
        comment,
        verifiedPurchase: true,
        isApproved: true
      },
      include: {
        user: { select: { name: true, avatar: true } }
      }
    });

    const formatted = {
      id: review.id,
      productId: review.productId,
      userName: review.user?.name || 'Verified Buyer',
      userAvatar: review.user?.avatar,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      date: 'Just now',
      verified: true
    };

    return sendSuccess(res, 201, 'Review submitted successfully!', formatted);
  } catch (error) {
    next(error);
  }
};
