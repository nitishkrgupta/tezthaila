import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  requestReturn
} from '../controllers/orderController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/', optionalAuth, getOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/cancel', optionalAuth, cancelOrder);
router.post('/:id/return', optionalAuth, requestReturn);

export default router;
