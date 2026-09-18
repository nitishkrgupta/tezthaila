import express from 'express';
import {
  validateCoupon,
  listCoupons,
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon
} from '../controllers/couponController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public customer routes
router.post('/validate', validateCoupon);
router.get('/', listCoupons);

// Admin coupon management routes
router.get('/admin', authenticateUser, requireAdmin, getAllCouponsAdmin);
router.post('/', authenticateUser, requireAdmin, createCoupon);
router.put('/:id', authenticateUser, requireAdmin, updateCoupon);
router.delete('/:id', authenticateUser, requireAdmin, deleteCoupon);

export default router;
