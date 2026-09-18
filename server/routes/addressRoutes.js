import express from 'express';
import {
  getAddresses,
  createAddress,
  deleteAddress
} from '../controllers/addressController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getAddresses);
router.post('/', optionalAuth, createAddress);
router.delete('/:id', optionalAuth, deleteAddress);

export default router;
