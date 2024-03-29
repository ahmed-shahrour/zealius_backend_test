const appRoot = require('app-root-path');
const createError = require('http-errors');

exports.notFoundError = (req, res, next) => {
  res.status(404).sendFile(`${appRoot}/views/notFound.html`, function(err) {
    if (err) {
      return next(
        createError(503, 'Failed to send HTML content', {
          isOperational: false,
          isResSent: false,
        })
      );
    }
  });
  return next(
    createError(404, 'Site Not Found', { isOperational: true, isResSent: true })
  );
};
