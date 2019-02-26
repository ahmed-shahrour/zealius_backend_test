const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const mongoose = require('mongoose');

const User = require('../models/user');
const tokensUtil = require('../util/creatingTokens');
const config = require('../config');

sgMail.setApiKey(
  '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'
);

exports.signup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let createdUser;

  User.findOne({ email: email })
    .then(user => {
      if (user) {
        const error = new Error('Email Exists.');
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
      return bcrypt.hash(password, 12);
    })
    .then(hashedPw => {
      const newUser = new User({
        email: email,
        password: hashedPw,
      });
      return newUser.save();
    })
    .then(savedUser => {
      createdUser = savedUser;
      return tokensUtil.createTokens(savedUser, config.secret);
    })
    .then(([accessToken]) => {
      return res.status(201).json({
        error: false,
        message: 'User Successfully Created!',
        token: accessToken,
        userId: createdUser._id.toString(),
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  const validation = (email, password) => {
    let isValid = true;
    const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
    // const splitEmail = email.split('@');

    isValid =
      isValid &&
      email &&
      // typeof email === String &&
      email.length < 320 &&
      // splitEmail[0] < 64 &&
      // splitEmail[1] < 255 &&
      reg.test(email) &&
      password &&
      // typeof password === String &&
      password.length >= 5 &&
      password.length <= 30;

    if (!isValid) {
      const error = new Error('Error with body sent');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    } else {
      return isValid;
    }
  };

  Promise.resolve()
    .then(() => validation(email, password))
    .then(() => User.findOne({ email: email }))
    .then(user => {
      if (!user) {
        const error = new Error('Invalid Login');
        error.statusCode = 401;
        error.isOperational = true;
        throw error;
      }
      loadedUser = user;
      // console.log(user.password);
      // console.log(password);
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Invalid Login');
        error.statusCode = 401;
        error.isOperational = true;
        throw error;
      }
      return tokensUtil.createTokens(loadedUser, config.secret);
    })
    .then(([accessToken]) => {
      res.status(200).json({
        error: false,
        message: 'User Successfully Logged In!',
        token: accessToken,
        userId: loadedUser._id.toString(),
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      return next(error);
    });
};

exports.postSendResetEmail = (req, res, next) => {
  const { email } = req.body;

  const validation = email => {
    let isValid = true;
    const reg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/;
    // const splitEmail = email.split('@');

    isValid =
      isValid &&
      email &&
      // typeof email === String &&
      // email.length < 320 &&
      // splitEmail[0] < 64 &&
      // splitEmail[1] < 255 &&
      reg.test(email);

    if (!isValid) {
      const error = new Error(
        'Error with email provided, please check format and type'
      );
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    } else {
      return isValid;
    }
  };

  let foundUser;

  Promise.resolve()
    .then(() => validation(email))
    .then(() => User.findOne({ email }))
    .then(user => {
      if (!user) {
        const error = new Error('Invalid Login');
        error.statusCode = 401;
        error.isOperational = true;
        throw error;
      } else {
        foundUser = user;
        // const token = tokensUtil.createResetPassToken(user, config.resetSecret);
        return tokensUtil.createResetPassToken(user, config.resetSecret);
      }
    })
    .then(([accessToken]) => {
      token = accessToken;
      const msg = {
        personalizations: [
          {
            to: [
              {
                email: foundUser.email,
              },
            ],
            dynamic_template_data: {
              first_name: foundUser.firstName,
              reset_token: accessToken,
              city: 'Dubai',
              country: 'United Arab Emirates',
            },
          },
        ],
        from: {
          email: 'automated@zealius.com',
          name: 'Zealius',
        },
        reply_to: {
          email: 'support@zealius.com',
          name: 'Ahmed Shahrour',
        },
        template_id: 'd-a5b3b8190a164469ae6b35aaaa8c0c79',
      };

      return sgMail.send(msg);
    })
    .then(() =>
      res.status(200).json({
        error: false,
        message: 'Successfully sent email!',
        email: email,
        token: token,
        //REMOVE TOKEN ABOVE AFTER TESTING
      })
    )
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getResetPassword = (req, res, next) => {
  const userId = req.userId;

  const validation = userId => {
    if (!userId) {
      const error = new Error('User ID not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !/^[a-fA-F0-9]{24}$/.test(userId)
    ) {
      const error = new Error('User ID invalid!');
      error.statusCode = 422;
      throw error;
    }
  };

  Promise.resolve()
    .then(() => validation(userId))
    .then(() => User.findById(userId))
    .then(user => {
      if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else {
        return res
          .status(200)
          .json({ error: false, message: 'Enter your new password!' });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.patchResetPassword = (req, res, next) => {
  const userId = req.userId;
  const { newPassword } = req.body;

  const validation = (userId, newPassword) => {
    if (!userId || !newPassword) {
      const error = new Error('User ID not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !/^[a-fA-F0-9]{24}$/.test(userId)
    ) {
      const error = new Error('User ID invalid!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    if (newPassword.length > 30 || newPassword.length < 5) {
      const error = new Error('Password format is invalid!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }
  };

  let foundUser;

  Promise.resolve()
    .then(() => validation(userId, newPassword))
    .then(() => User.findById(userId))
    .then(user => {
      if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else {
        foundUser = user;
        return bcrypt.hash(newPassword, 12);
      }
    })
    .then(hashedNewPw => {
      foundUser.password = hashedNewPw;
      return foundUser.save();
    })
    .then(savedUser => {
      foundUser = savedUser;
      return tokensUtil.createTokens(savedUser, config.secret);
    })
    .then(([accessToken]) => {
      return res.status(201).json({
        error: false,
        message: 'Password updated!',
        token: accessToken,
        userId: foundUser._id.toString(),
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

//SPLIT THE ABOVE TO TWO APIS. ONE GET (when user clicks link button in email) AND ONE PATCH (for when user enters newPassword)
