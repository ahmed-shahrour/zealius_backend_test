const express = require('express');

const websiteController = require('../controllers/website');

const router = express.Router();

router.get('/privacy_policy', websiteController.privacyPolicy);
router.get('/', websiteController.welcome);

module.exports = router;
