import express from 'express';
import { body, param, query } from 'express-validator';
import {
  submitLeaveApplication,
  getAllLeaveApplications,
  getLeaveApplicationById,
  reviewLeaveApplication,
  updateLeaveApplication,
  deleteLeaveApplication,
  getLeaveStatistics
} from '../controllers/leaveController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import  rateLimiter  from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const validateLeaveApplication = [
  body('type')
    .isIn(['sick', 'family', 'personal', 'academic', 'emergency'])
    .withMessage('Invalid leave type'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ max: 1000 })
    .withMessage('Reason cannot exceed 1000 characters'),
  body('fromDate')
    .isISO8601()
    .withMessage('Valid start date is required')
    .custom(value => {
      if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),
  body('toDate')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.fromDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

const validateReview = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('reviewComments')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review comments cannot exceed 500 characters')
];

// Apply rate limiting and authentication
router.use(rateLimiter);
router.use(authenticateToken);

// Routes accessible by students and admins
router.post('/', validateLeaveApplication, submitLeaveApplication);

router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled', 'All']),
  query('type').optional().isIn(['sick', 'family', 'personal', 'academic', 'emergency', 'All']),
  query('sortBy').optional().isIn(['createdAt', 'fromDate', 'toDate', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], getAllLeaveApplications);

router.get('/statistics', requireRole(['admin']), getLeaveStatistics);

router.get('/:id', [
  param('id').isMongoId().withMessage('Valid application ID is required')
], getLeaveApplicationById);

router.put('/:id', [
  param('id').isMongoId().withMessage('Valid application ID is required'),
  ...validateLeaveApplication
], updateLeaveApplication);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid application ID is required')
], deleteLeaveApplication);

// Admin-only routes
router.put('/:id/review', requireRole(['admin']), [
  param('id').isMongoId().withMessage('Valid application ID is required'),
  ...validateReview
], reviewLeaveApplication);

export default router;