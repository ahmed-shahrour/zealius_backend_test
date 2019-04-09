const express = require('express');

const websiteController = require('../controllers/website');

const router = express.Router();

router.get('/', websiteController.welcome);
router.get('/privacy_policy', websiteController.privacyPolicy);

module.exports = router;
