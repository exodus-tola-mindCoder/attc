import express from 'express';
import { body } from 'express-validator';


import { auth, authorize } from '../middleware/auth.middleware.js';

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
router.get('/', auth, getSemesters);
router.get('/active', auth, getActiveSemester);
router.get('/:id/statistics', auth, authorize(['admin']), getSemesterStatistics);

// Admin only routes
router.post('/', auth, authorize(['admin']), semesterValidation, createSemester);
router.put('/:id', auth, authorize(['admin']), updateSemesterValidation, updateSemester);
router.delete('/:id', auth, authorize(['admin']), deleteSemester);
router.put('/:id/activate', auth, authorize(['admin']), setActiveSemester);

export default router;