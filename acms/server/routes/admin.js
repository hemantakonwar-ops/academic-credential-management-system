const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, requireAdmin } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  updateUserStatus,
  deleteUser,
  manageCategory,
  getAuditLogs,
} = require('../controllers/adminController');

// All admin routes require JWT + Admin role
router.use(protect, requireAdmin);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: System overview stats
 *     tags: [Admin]
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Paginated user list with document counts
 *     tags: [Admin]
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Suspend or reactivate a user account
 *     tags: [Admin]
 */
router.put(
  '/users/:id/status',
  [body('isActive').isBoolean().withMessage('isActive must be a boolean')],
  validate,
  updateUserStatus
);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Permanently delete user + all their data
 *     tags: [Admin]
 */
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /api/admin/categories:
 *   put:
 *     summary: Add or deactivate a category
 *     tags: [Admin]
 */
router.put(
  '/categories',
  [
    body('action').isIn(['add', 'deactivate']).withMessage('action must be add or deactivate'),
    body('name').trim().notEmpty().withMessage('Category name is required'),
  ],
  validate,
  manageCategory
);

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Filterable audit logs
 *     tags: [Admin]
 */
router.get('/audit-logs', getAuditLogs);

module.exports = router;
