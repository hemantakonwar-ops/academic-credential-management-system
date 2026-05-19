const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { getMe, updateMe, deleteMe, changePassword } = require('../controllers/userController');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile + stats
 *     tags: [Users]
 */
router.get('/me', protect, getMe);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update profile (name, institution, picture)
 *     tags: [Users]
 */
router.put(
  '/me',
  protect,
  [
    body('fullName').optional().trim().isLength({ max: 100 }),
    body('institution').optional().trim().isLength({ max: 150 }),
    body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
  ],
  validate,
  updateMe
);

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Change password (requires current password)
 *     tags: [Users]
 */
router.put(
  '/me/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  changePassword
);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Permanently delete account + all documents
 *     tags: [Users]
 */
router.delete('/me', protect, deleteMe);

module.exports = router;
