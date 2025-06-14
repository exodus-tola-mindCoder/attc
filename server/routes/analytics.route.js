import express from 'express';
import {
  getStudentsByCity,
  getHealthStatus,
  getEnrollmentStats,
  getRecentActivity
} from '../controllers/analyticsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/students-by-city', authenticateToken, requireRole(['admin']), getStudentsByCity);
router.get('/health-status', authenticateToken, requireRole(['admin', 'clinic']), getHealthStatus);
router.get('/enrollment-stats', authenticateToken, requireRole(['admin']), getEnrollmentStats);
router.get('/recent-activity', authenticateToken, requireRole(['admin']), getRecentActivity);

export default router;