const jwt = require('jsonwebtoken');
const _ = require('lodash');

exports.createTokens = async (user, secret) => {
  const createToken = jwt.sign(
    {
      user: _.pick(user, ['_id', 'email', 'admin']),
    },
    secret + user.password
  );

  return Promise.all([createToken]);
};

exports.createResetPassToken = async (user, secret) => {
  const createToken = jwt.sign(
    {
      user: _.pick(user, ['_id']),
    },
    secret,
    { expiresIn: '20m' }
  );

  return Promise.all([createToken]);
};
