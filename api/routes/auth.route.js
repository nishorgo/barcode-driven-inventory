const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/auth.controller');

// Register route with validation
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  register
);

// Login route with validation
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  login
);

router.post('/logout', logout);

module.exports = router;