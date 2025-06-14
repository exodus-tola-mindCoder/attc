import express from 'express';
import { body } from 'express-validator';

import {
  getSemesters,
  getActiveSemester,
  getSemesterStatistics,
  createSemester,
  updateSemester,
  deleteSemester,
  setActiveSemester
} from '../controllers/semesterController.js'


import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();



// Validation rules
const semesterValidation = [
  body('name').notEmpty().trim().withMessage('Semester name is required'),
  body('academicYear').notEmpty().trim().withMessage('Academic year is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('registrationStartDate').isISO8601().withMessage('Valid registration start date is required'),
  body('registrationEndDate').isISO8601().withMessage('Valid registration end date is required'),
  body('description').optional().trim()
];

const updateSemesterValidation = [
  body('name').optional().notEmpty().trim().withMessage('Semester name cannot be empty'),
  body('academicYear').optional().notEmpty().trim().withMessage('Academic year cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
  body('registrationStartDate').optional().isISO8601().withMessage('Valid registration start date is required'),
  body('registrationEndDate').optional().isISO8601().withMessage('Valid registration end date is required'),
  body('description').optional().trim()
];


// Public routes (accessible to all authenticated users)
router.get('/', authenticateToken, getSemesters);
router.get('/active', authenticateToken, getActiveSemester);
router.get('/:id/statistics', authenticateToken, requireRole(['admin']), getSemesterStatistics);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), semesterValidation, createSemester);
router.put('/:id', authenticateToken, requireRole(['admin']), updateSemesterValidation, updateSemester);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteSemester);
router.put('/:id/activate', authenticateToken, requireRole(['admin']), setActiveSemester);

export default router;