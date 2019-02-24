const express = require('express');

const authController = require('../controllers/auth');
const checkResetPassToken = require('../middlewares/checkResetPassToken');

const router = express.Router();

// User Signup and Login
router.put('/signup', authController.signup);
router.post('/login', authController.login);

// Reset Password
router.post('/resetpass', authController.postSendResetEmail);
router.get(
  '/resetpass/:resetToken',
  checkResetPassToken,
  authController.getResetPassword
);
router.patch(
  '/resetpass/:resetToken',
  checkResetPassToken,
  authController.patchResetPassword
);

module.exports = router;
