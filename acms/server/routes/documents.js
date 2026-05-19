const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { upload, verifyMimeType } = require('../middleware/upload');
const {
  getDocuments,
  uploadDocument,
  getDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { CATEGORIES } = require('../models/Document');

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: List documents with filters
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: institution
 *         schema: { type: string }
 */
router.get('/', protect, getDocuments);

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a new document (multipart/form-data)
 *     tags: [Documents]
 */
router.post(
  '/',
  protect,
  upload.single('file'),
  verifyMimeType,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
    body('category').notEmpty().withMessage('Category is required').isIn(CATEGORIES).withMessage('Invalid category'),
    body('institutionName').optional().trim().isLength({ max: 150 }),
    body('remarks').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  uploadDocument
);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get a single document (ownership enforced)
 *     tags: [Documents]
 */
router.get('/:id', protect, getDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update document metadata (no re-upload)
 *     tags: [Documents]
 */
router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().isLength({ max: 100 }),
    body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
    body('institutionName').optional().trim().isLength({ max: 150 }),
    body('remarks').optional().trim().isLength({ max: 500 }),
  ],
  validate,
  updateDocument
);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Permanently delete document + cloud file
 *     tags: [Documents]
 */
router.delete('/:id', protect, deleteDocument);

module.exports = router;
