import express from 'express';
import multer from 'multer';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProductStock,
  deleteProduct,
  bulkDeleteProducts,
  downloadProductTemplate,
  bulkUploadProducts
} from '../controllers/productController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Public customer routes
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);

// Admin bulk endpoints
router.get('/sample-template', downloadProductTemplate);
router.post('/bulk-upload', authenticateUser, requireAdmin, uploadExcel.single('file'), bulkUploadProducts);
router.post('/bulk-delete', authenticateUser, requireAdmin, bulkDeleteProducts);

// Admin single product endpoints
router.post('/', authenticateUser, requireAdmin, createProduct);
router.put('/:id/stock', authenticateUser, requireAdmin, updateProductStock);
router.delete('/:id', authenticateUser, requireAdmin, deleteProduct);

export default router;
