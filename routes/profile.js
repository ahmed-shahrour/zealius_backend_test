const express = require('express');

const profileController = require('../controllers/profile');
const checkAccessToken = require('../middlewares/checkAccessToken');

const router = express.Router();

router.get('/', checkAccessToken, profileController.getProfile);

//Change to patch api
router.post('/', checkAccessToken, profileController.postProfile);

router.patch(
  '/update/password',
  checkAccessToken,
  profileController.patchChangePassword
);

module.exports = router;
