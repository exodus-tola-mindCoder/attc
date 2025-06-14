import express from 'express';
import { body, param, query } from 'express-validator';

import {
  createHealthRecord,
  getAllHealthRecords,
  getHealthRecordByStudentId,
  updateHealthRecord,
  deleteHealthRecord,
  addMedicalVisit,
  getHealthStatistics
} from '../controllers/healthController.js';

import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

import  rateLimiter  from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation middleware
const validateHealthRecord = [
  body('studentId')
    .isMongoId()
    .withMessage('Valid student ID is required'),
  body('disabilities')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Disabilities description cannot exceed 1000 characters'),
  body('diseases')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Diseases description cannot exceed 1000 characters'),
  body('supportNeeded')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Support needed description cannot exceed 1000 characters'),
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'])
    .withMessage('Invalid blood type'),
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ max: 100 })
    .withMessage('Emergency contact name cannot exceed 100 characters'),
  body('emergencyContact.phone')
    .matches(/^\+?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
];


const validateMedicalVisit = [
  body('visitDate')
    .isISO8601()
    .withMessage('Valid visit date is required')
    .custom(value => {
      if (new Date(value) > new Date()) {
        throw new Error('Visit date cannot be in the future');
      }
      return true;
    }),
  body('reason')
    .notEmpty()
    .withMessage('Visit reason is required')
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
  body('treatment')
    .notEmpty()
    .withMessage('Treatment description is required')
    .isLength({ max: 1000 })
    .withMessage('Treatment description cannot exceed 1000 characters'),
  body('doctor')
    .notEmpty()
    .withMessage('Doctor name is required')
    .isLength({ max: 100 })
    .withMessage('Doctor name cannot exceed 100 characters')
];

const validateStudentId = [
  param('studentId')
    .isMongoId()
    .withMessage('Valid student ID is required')
];


// Apply rate limiting to all health routes
router.use(rateLimiter);


// Apply authentication and role-based access control
router.use(authenticateToken);
router.use(requireRole(['admin', 'clinic']));


// Routes
router.post('/records', validateHealthRecord, createHealthRecord);


router.get('/records', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', 'All']),
  query('hasDisabilities').optional().isBoolean(),
  query('hasAllergies').optional().isBoolean(),
  query('sortBy').optional().isIn(['updatedAt', 'createdAt', 'bloodType']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], getAllHealthRecords);


router.get('/records/:studentId', validateStudentId, getHealthRecordByStudentId);

router.get('/records/:studentId', validateStudentId, getHealthRecordByStudentId);

router.put('/records/:studentId', [...validateStudentId, ...validateHealthRecord], updateHealthRecord);

router.delete('/records/:studentId', validateStudentId, deleteHealthRecord);

router.post('/records/:studentId/visits', [...validateStudentId, ...validateMedicalVisit], addMedicalVisit);

router.get('/statistics', getHealthStatistics);

export default router;