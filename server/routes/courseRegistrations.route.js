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
import { auth, authorize } from '../middleware/auth.middleware.js';

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
router.post('/register', auth, authorize(['student']), registrationValidation, registerForCourses);
router.get('/my-registrations', auth, authorize(['student']), getStudentRegistrations);
router.put('/drop/:registrationId', auth, authorize(['student']), dropCourse);
router.get('/available-courses', auth, authorize(['student']), getAvailableCourses);

// Admin routes
router.get('/', auth, authorize(['admin']), getAllRegistrations);
router.put('/:registrationId/status', auth, authorize(['admin']), statusUpdateValidation, updateRegistrationStatus);
router.put('/:registrationId/grade', auth, authorize(['admin']), gradeValidation, addGrade);
router.get('/statistics', auth, authorize(['admin']), getRegistrationStatistics);

export default router;