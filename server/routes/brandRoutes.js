import express from 'express';
import { getBrands } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getBrands);

export default router;
