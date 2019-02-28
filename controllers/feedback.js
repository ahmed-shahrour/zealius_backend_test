const Feedback = require('../models/feedback');
const createError = require('http-errors');

exports.postFeedback = (req, res, next) => {
  const feedback = req.body.feedback;
  if (!feedback) {
    throw createError(400, 'No Feedback Provided', {
      isOperational: true,
      isResSent: false,
    });
  }
  const newFeedback = new Feedback({
    feedback: feedback,
  });
  newFeedback
    .save()
    .then(feedback => {
      res.status(201).json({
        message: 'Successfully submitted a feedback!',
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
