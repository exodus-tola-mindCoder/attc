import express from 'express';
import {
  sendMessage,
  getConversation,
  getUnreadMessages,
  getAllUsers,
  markAsRead
} from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/send', authenticateToken, sendMessage);
router.get('/conversation/:userId', authenticateToken, getConversation);
router.get('/unread', authenticateToken, getUnreadMessages);
router.get('/users', authenticateToken, getAllUsers);
router.put('/read/:messageId', authenticateToken, markAsRead);

export default router;