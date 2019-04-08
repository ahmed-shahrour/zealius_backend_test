const Feedback = require('../models/feedback');
const createError = require('http-errors');
const Bottleneck = require('bottleneck');

const group = new Bottleneck.Group({
  maxConcurrent: 1,
  minTime: 1000,
  highWater: 3,
  strategy: Bottleneck.strategy.BLOCK,
  penalty: 5000,
});

exports.postFeedback = (req, res, next) => {
  group
    .key(req.ip)
    .schedule(() => {
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
      return newFeedback.save();
    })
    .then(feedback => {
      res.status(201).json({
        message: 'Successfully submitted feedback!',
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
