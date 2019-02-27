const appRoot = require('app-root-path');
const createError = require('http-errors');

exports.welcome = (req, res, next) => {
  res.status(200).sendFile(`${appRoot}/views/welcome.html`, function(err) {
    if (err) {
      return next(
        createError(503, 'Failed to send HTML content', {
          isOperational: false,
          isResSent: false,
        })
      );
    }
  });
};
