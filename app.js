const express = require('express');
const winston = require('./winston');
const mongoose = require('mongoose');

mongoose.plugin(require('./util/diffPlugin'));

const { preSetup } = require('./app/beforeInitRoutes');
const { initRoutes } = require('./app/routes');
const { dbConnection } = require('./app/db');

// Initiating Express
const app = express();

// For logging and parsing requests
preSetup(app);

// Routes of the app
initRoutes(app);

// Global Error Handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.log(error);
  // console.log(error.isOperational);

  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  winston.error(
    `${error.statusCode || 500} - ${error.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  const status = error.statusCode || 500;
  const message = error.message || null;

  if (!error.isResSent) {
    res.set('Content-Type', 'application/json');
    res.status(status);
    res.json({ error: error.toString() });
  }
});

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err);
  process.exit(1);
});

// Database connection
dbConnection(app);
