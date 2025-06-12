import express from 'express'
import rateLimiter from '../middleware/rateLimiter.js';

import {
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentStatistics
} from '../controllers/departmentController.js';

import { body, param, query } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// validation middleware

const validateDepartment = [
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('code')
    .notEmpty()
    .withMessage('Department code is required')
    .isLength({ max: 10 })
    .withMessage('Department code cannot exceed 10 characters')
    .isAlphanumeric()
    .withMessage('Department code must be alphanumeric'),
  body('head')
    .notEmpty()
    .withMessage('Department head is required')
    .isLength({ max: 100 })
    .withMessage('Department head name cannot exceed 100 characters'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('faculty')
    .notEmpty()
    .withMessage('Faculty is required'),
  body('contact.phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
];

// Apply rate limiting
router.use(rateLimiter);


// Public routes (no authentication required)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['name', 'code', 'faculty', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], getAllDepartments);


router.get('/statistics', getDepartmentStatistics);

router.get('/:id', [
  param('id').isMongoId().withMessage('Valid department ID is required')
], getDepartmentById);

// Admin only routes

router.use(authenticateToken);
router.use(requireRole(['admin']));


router.put('/:id', [
  param('id').isMongoId().withMessage('Valid department ID is required'),
  ...validateDepartment
], updateDepartment);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Valid department ID is required')
], deleteDepartment);




export default router;