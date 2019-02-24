const Feedback = require('../models/feedback');

exports.postFeedback = (req, res, next) => {
  const feedback = req.body.feedback;
  if (!feedback) {
    const error = new Error('No Feedback Provided');
    error.statusCode = 401;
    throw error;
  }
  const newFeedback = new Feedback({
    feedback: feedback,
  });
  newFeedback
    .save()
    .then(feedback => {
      res.status(201).json({
        error: false,
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
