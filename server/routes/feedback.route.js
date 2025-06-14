import express from 'express';
import { body, param, query } from 'express-validator';
import {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  respondToFeedback,
  deleteFeedback,
  getFeedbackStatistics
} from '../controllers/feedbackController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import  rateLimiter  from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const validateFeedback = [
  body('type')
    .isIn(['suggestion', 'complaint', 'feedback', 'bug_report', 'feature_request'])
    .withMessage('Invalid feedback type'),
  body('category')
    .isIn(['clinic', 'admin', 'course', 'instructor', 'facility', 'system', 'general'])
    .withMessage('Invalid category'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
];

const validateStatusUpdate = [
  body('status')
    .isIn(['new', 'in_review', 'resolved', 'closed', 'rejected'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Valid user ID required for assignment')
];

const validateResponse = [
  body('message')
    .notEmpty()
    .withMessage('Response message is required')
    .isLength({ max: 1000 })
    .withMessage('Response cannot exceed 1000 characters')
];

// Apply rate limiting and authentication
router.use(rateLimiter);
router.use(authenticateToken);

// Routes accessible by all authenticated users
router.post('/', validateFeedback, submitFeedback);

router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['new', 'in_review', 'resolved', 'closed', 'rejected', 'All']),
  query('type').optional().isIn(['suggestion', 'complaint', 'feedback', 'bug_report', 'feature_request', 'All']),
  query('category').optional().isIn(['clinic', 'admin', 'course', 'instructor', 'facility', 'system', 'general', 'All']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent', 'All']),
  query('sortBy').optional().isIn(['createdAt', 'status', 'priority', 'type']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], getAllFeedback);

router.get('/statistics', requireRole(['admin']), getFeedbackStatistics);

router.get('/:id', [
  param('id').isMongoId().withMessage('Valid feedback ID is required')
], getFeedbackById);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid feedback ID is required')
], deleteFeedback);

// Admin and staff routes
router.put('/:id/status', requireRole(['admin', 'clinic']), [
  param('id').isMongoId().withMessage('Valid feedback ID is required'),
  ...validateStatusUpdate
], updateFeedbackStatus);

router.post('/:id/respond', requireRole(['admin', 'clinic']), [
  param('id').isMongoId().withMessage('Valid feedback ID is required'),
  ...validateResponse
], respondToFeedback);

export default router;