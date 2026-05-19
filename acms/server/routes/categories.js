const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCategories } = require('../controllers/categoryController');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Categories]
 */
router.get('/', protect, getCategories);

module.exports = router;
