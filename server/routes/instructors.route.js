import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createInstructor,
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  assignCourse,
  unassignCourse
} from '../controllers/instructorController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const validateInstructor = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),
  body('photoUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL for photo')
];

const validateCourseAssignment = [
  body('instructorId')
    .isMongoId()
    .withMessage('Valid instructor ID is required'),
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required')
];

// Apply rate limiting and authentication
router.use(rateLimiter);
router.use(authenticateToken);

// Public routes (for students to view instructor info)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'department', 'experience', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], getAllInstructors);

router.get('/:id', [
  param('id').isMongoId().withMessage('Valid instructor ID is required')
], getInstructorById);

// Admin-only routes
router.post('/', requireRole(['admin']), validateInstructor, createInstructor);

router.put('/:id', requireRole(['admin']), [
  param('id').isMongoId().withMessage('Valid instructor ID is required'),
  ...validateInstructor
], updateInstructor);

router.delete('/:id', requireRole(['admin']), [
  param('id').isMongoId().withMessage('Valid instructor ID is required')
], deleteInstructor);

router.post('/assign-course', requireRole(['admin']), validateCourseAssignment, assignCourse);

router.post('/unassign-course', requireRole(['admin']), validateCourseAssignment, unassignCourse);

export default router;