import express from 'express';
import { getProductReviews, addReview } from '../controllers/reviewController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', optionalAuth, addReview);

export default router;
