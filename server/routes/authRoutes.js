import { Router } from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout, 
  updateProfile 
} from '../controllers/authController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);
router.put('/profile', authenticateUser, updateProfile);

export default router;
