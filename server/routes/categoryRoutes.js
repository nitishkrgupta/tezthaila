import express from 'express';
import { getCategories, getSubcategories, getBrands } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/subcategories', getSubcategories);
router.get('/brands', getBrands);
router.get('/:categoryId/subcategories', getSubcategories);

export default router;
