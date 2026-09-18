import express from 'express';
import { getCategories, getSubcategories, getBrands, createCategory, createSubcategory } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', createCategory);
router.get('/subcategories', getSubcategories);
router.post('/subcategories', createSubcategory);
router.get('/brands', getBrands);
router.get('/:categoryId/subcategories', getSubcategories);

export default router;
