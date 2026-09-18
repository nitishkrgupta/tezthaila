import express from 'express';
import {
  getBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner
} from '../controllers/bannerController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getBanners);

// Admin only
router.get('/admin', authenticateUser, requireAdmin, getAllBannersAdmin);
router.post('/', authenticateUser, requireAdmin, createBanner);
router.put('/:id', authenticateUser, requireAdmin, updateBanner);
router.delete('/:id', authenticateUser, requireAdmin, deleteBanner);

export default router;
