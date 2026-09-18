import express from 'express';
import { getDeals, updateDealsAdmin } from '../controllers/dealController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Fetch active Deals of the Day and countdown endsAt
router.get('/', getDeals);

// Admin: Modify Deals of the Day and start/update timer
router.put('/admin', authenticateUser, requireAdmin, updateDealsAdmin);
router.post('/admin', authenticateUser, requireAdmin, updateDealsAdmin);

export default router;
