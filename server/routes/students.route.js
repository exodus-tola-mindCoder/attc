import express from 'express';
const router = express.Router();
import {
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../controllers/studentController.js';

import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

// Routes
router.post('/register', authenticateToken, requireRole(['student']), registerStudent);
router.get('/', authenticateToken, requireRole(['admin', 'clinic']), getAllStudents);
router.get('/:id', authenticateToken, getStudentById);
router.put('/:id', authenticateToken, updateStudent);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteStudent);

export default router;