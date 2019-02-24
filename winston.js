const appRoot = require('app-root-path');
const winston = require('winston');

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    timestamp: true,
    colorize: true,
  },
  errorFile: {
    level: 'error',
    filename: `${appRoot}/logs/errors.log`,
    handleExceptions: true,
    json: true,
    timestamp: true,
  },
  uncaughtExceptionsFile: {
    filename: `${appRoot}/logs/unhandledErrors.log`,
    handleExceptions: true,
    json: true,
    timestamp: true,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = new winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.File(options.errorFile),
    new winston.transports.Console(options.console),
  ],
  exceptionHandlers: [
    new winston.transports.File(options.uncaughtExceptionsFile),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
