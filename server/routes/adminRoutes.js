import express from 'express';
import { getAdminStats, updateOrderStatus } from '../controllers/adminController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', authenticateUser, requireAdmin, getAdminStats);
router.put('/orders/:id/status', authenticateUser, requireAdmin, updateOrderStatus);

// Endpoint to trigger seed manually if needed
router.post('/seed', async (req, res, next) => {
  try {
    const { runSeed } = await import('../prisma/seed.js');
    await runSeed();
    res.json({ success: true, message: 'Database seeded successfully with default categories, products, and admin!' });
  } catch (err) {
    next(err);
  }
});

export default router;
