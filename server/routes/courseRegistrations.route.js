import express from 'express';
import { body } from 'express-validator';
import {
  registerForCourses,
  getStudentRegistrations,
  dropCourse,
  getAllRegistrations,
  updateRegistrationStatus,
  addGrade,
  getRegistrationStatistics,
  getAvailableCourses
} from '../controllers/courseRegistrationController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const registrationValidation = [
  body('courseIds').isArray({ min: 1 }).withMessage('At least one course ID is required'),
  body('courseIds.*').isMongoId().withMessage('Valid course IDs are required'),
  body('semesterId').isMongoId().withMessage('Valid semester ID is required')
];

const gradeValidation = [
  body('grade').isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
  body('notes').optional().trim()
];

const statusUpdateValidation = [
  body('status').isIn(['registered', 'dropped', 'pending', 'approved', 'rejected']).withMessage('Valid status is required'),
  body('notes').optional().trim()
];

// Student routes
router.post('/register', authenticateToken, requireRole(['student']), registrationValidation, registerForCourses);
router.get('/my-registrations', authenticateToken, requireRole(['student']), getStudentRegistrations);
router.put('/drop/:registrationId', authenticateToken, requireRole(['student']), dropCourse);
router.get('/available-courses', authenticateToken, requireRole(['student']), getAvailableCourses);

// Admin routes
router.get('/', authenticateToken, requireRole(['admin']), getAllRegistrations);
router.put('/:registrationId/status', authenticateToken, requireRole(['admin']), statusUpdateValidation, updateRegistrationStatus);
router.put('/:registrationId/grade', authenticateToken, requireRole(['admin']), gradeValidation, addGrade);
router.get('/statistics', authenticateToken, requireRole(['admin']), getRegistrationStatistics);

export default router;