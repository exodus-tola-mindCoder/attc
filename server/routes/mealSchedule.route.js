import express from 'express';
import { body } from 'express-validator';
import {
  getMealSchedules,
  createMealSchedule,
  updateMealSchedule,
  deleteMealSchedule,
  getMealScheduleById,
  getMealStatistics
} from '../controllers/mealScheduleController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const mealScheduleValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('mealType').isIn(['breakfast', 'lunch', 'dinner']).withMessage('Valid meal type is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one meal item is required'),
  body('items.*').notEmpty().withMessage('Meal items cannot be empty'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('nutritionalInfo.calories').optional().isNumeric().withMessage('Calories must be a number'),
  body('allergens').optional().isArray().withMessage('Allergens must be an array'),
  body('isSpecialMenu').optional().isBoolean().withMessage('isSpecialMenu must be a boolean')
];

// Public routes (accessible to all authenticateTokenenticated users)
router.get('/', authenticateToken, getMealSchedules);
router.get('/statistics', authenticateToken, requireRole(['admin']), getMealStatistics);
router.get('/:id', authenticateToken, getMealScheduleById);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), mealScheduleValidation, createMealSchedule);
router.put('/:id', authenticateToken, requireRole(['admin']), mealScheduleValidation, updateMealSchedule);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteMealSchedule);

export default router;