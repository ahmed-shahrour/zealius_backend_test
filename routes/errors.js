const express = require('express');

const errorsController = require('../controllers/errors');

const router = express.Router();

router.use(errorsController.notFoundError);

module.exports = router;
