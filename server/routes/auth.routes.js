import { authenticateToken } from '../middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();
import { register, login, getMe } from '../controllers/authController.js';


router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

export default router;