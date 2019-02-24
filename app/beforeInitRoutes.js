const bodyParser = require('body-parser');
const morgan = require('morgan');

const winston = require('../winston');

exports.preSetup = app => {
  // Morgan logs all HTTP requests
  app.use(morgan('combined', { stream: winston.stream }));

  // This parses the body of the incoming json object
  app.use(bodyParser.json());

  // This ensures the correct headers are applied (DOUBLE CHECK THIS ONE BEFORE PRODUCTION)
  app.use((req, res, next) => {
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });
};
