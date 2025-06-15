import express from 'express';
import { body } from 'express-validator';
import {
  getGraduationImages,
  uploadGraduationImage,
  getGraduationImageById,
  updateGraduationImage,
  deleteGraduationImage,
  getGalleryStatistics,
  getImagesForAdmin
} from '../controllers/graduationImageController.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules
const imageValidation = [
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 10 }).withMessage('Valid year is required'),
  body('department').notEmpty().trim().withMessage('Department is required'),
  body('caption').optional().isLength({ max: 500 }).withMessage('Caption must be less than 500 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string')
];

const updateValidation = [
  body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 10 }).withMessage('Valid year is required'),
  body('department').optional().notEmpty().trim().withMessage('Department cannot be empty'),
  body('caption').optional().isLength({ max: 500 }).withMessage('Caption must be less than 500 characters'),
  body('tags').optional().isString().withMessage('Tags must be a string')
];

// Public routes (accessible to all authenticateTokenenticated users)
router.get('/', authenticateToken, getGraduationImages);
router.get('/statistics', authenticateToken, requireRole(['admin']), getGalleryStatistics);
router.get('/admin', authenticateToken, requireRole(['admin']), getImagesForAdmin);
router.get('/:id', authenticateToken, getGraduationImageById);

// Admin only routes
router.post('/', authenticateToken, requireRole(['admin']), imageValidation, uploadGraduationImage);
router.put('/:id', authenticateToken, requireRole(['admin']), updateValidation, updateGraduationImage);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteGraduationImage);

export default router;