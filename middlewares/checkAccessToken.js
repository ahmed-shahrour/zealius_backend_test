let jwt = require('jsonwebtoken');
const atob = require('atob');

const User = require('../models/user');
const config = require('../config');

module.exports = (req, res, next) => {
  let token;
  let b64Payload;
  let decodedPayload;

  Promise.resolve()
    .then(() => {
      token = req.headers['authorization'];
      if (!token) {
        const error = new Error(
          'Token not provided in authorization request header'
        );
        error.statusCode = 500;
        throw error;
      }
      if (token.startsWith('Bearer ')) {
        return (token = token.slice(7, token.length));
      }
    })
    .then(() => (b64Payload = token.split('.')[1]))
    .then(() => (decodedPayload = JSON.parse(atob(b64Payload))))
    .then(() => User.findById(decodedPayload.user._id))
    .then(user => {
      if (!user) {
        const error = new Error('Token invalid');
        error.statusCode = 404;
        throw error;
      }

      if (token) {
        jwt.verify(token, config.secret + user.password, (err, decoded) => {
          if (err) {
            err.statusCode = 500;
            throw err;
          } else {
            req.decodedToken = decoded;
            req.userId = decoded.user._id;
            if (!decoded.user._id) {
              const error = new Error('Unauthenticated!');
              error.statusCode = 401;
              throw error;
            } else {
              return next();
            }
          }
        });
      } else {
        const error = new Error('Auth token is not supplied');
        error.statusCode = 401;
        throw error;
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
