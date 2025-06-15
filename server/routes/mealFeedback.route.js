import express from 'express';
import { body } from 'express-validator';
import {
  submitMealFeedback,
  getMealFeedback,
  getFeedbackStatistics,
  getMyFeedback,
  updateMealFeedback,
  deleteMealFeedback
} from '../controllers/mealFeedbackController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const feedbackValidation = [
  body('mealScheduleId').isMongoId().withMessage('Valid meal schedule ID is required'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner']).withMessage('Valid meal type is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters'),
  body('categories.taste').optional().isInt({ min: 1, max: 5 }).withMessage('Taste rating must be between 1 and 5'),
  body('categories.quality').optional().isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),
  body('categories.portion').optional().isInt({ min: 1, max: 5 }).withMessage('Portion rating must be between 1 and 5'),
  body('categories.service').optional().isInt({ min: 1, max: 5 }).withMessage('Service rating must be between 1 and 5'),
  body('suggestions').optional().isLength({ max: 300 }).withMessage('Suggestions must be less than 300 characters'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean')
];

// Student routes
router.post('/', authenticateToken, requireRole(['student']), feedbackValidation, submitMealFeedback);
router.get('/my-feedback', authenticateToken, requireRole(['student']), getMyFeedback);
router.put('/:id', authenticateToken, requireRole(['student']), updateMealFeedback);

// Admin routes
router.get('/', authenticateToken, requireRole(['admin']), getMealFeedback);
router.get('/statistics', authenticateToken, requireRole(['admin']), getFeedbackStatistics);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteMealFeedback);

export default router;