let jwt = require('jsonwebtoken');

const config = require('../config');

module.exports = (req, res, next) => {
  let token = req.headers['authorization'];
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        // if (
        //   err.name === 'TokenExpiredError' &&
        //   err.message === 'jwt expired' &&
        //   err.expiredAt <= new Date().getTime()
        // ) {
        //   err.statusCode = 401;
        //   err.message = 'Token Expired';
        //   throw err;
        // } else {
        err.statusCode = 500;
        throw err;
        // }
      } else {
        req.decodedToken = decoded;
        req.userId = decoded.user._id;
        next();
      }
    });
  } else {
    const error = new Error('Auth token is not supplied');
    error.statusCode = 401;
    throw error;
  }
};
