import express from 'express';
import { getAdminStats, updateOrderStatus } from '../controllers/adminController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', authenticateUser, requireAdmin, getAdminStats);
router.put('/orders/:id/status', authenticateUser, requireAdmin, updateOrderStatus);

export default router;
