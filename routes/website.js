const express = require('express');

const websiteController = require('../controllers/website');

const router = express.Router();

router.get('/', websiteController.welcome);

module.exports = router;
