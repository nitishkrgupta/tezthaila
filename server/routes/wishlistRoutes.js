import express from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getWishlist);
router.post('/', optionalAuth, toggleWishlist);
router.post('/:productId', optionalAuth, toggleWishlist);

export default router;
