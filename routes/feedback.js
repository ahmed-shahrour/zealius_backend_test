const express = require('express');

const feedbackController = require('../controllers/feedback');

const router = express.Router();

router.post('/', feedbackController.postFeedback);

module.exports = router;
