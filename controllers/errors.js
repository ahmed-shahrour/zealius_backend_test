exports.notFoundError = (req, res, next) => {
  const error = new Error('Not Found');
  error.statusCode = 404;
  return next(error);
};
