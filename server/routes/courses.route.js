import express from 'express';
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent
} from '../controllers/courseController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getAllCourses);
router.post('/', authenticateToken, requireRole(['admin']), createCourse);
router.put('/:id', authenticateToken, requireRole(['admin']), updateCourse);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteCourse);
router.post('/enroll', authenticateToken, requireRole(['admin']), enrollStudent);

export default router;