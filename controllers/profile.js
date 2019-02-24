const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/user');
const tokensUtil = require('../util/creatingTokens');
const config = require('../config');

exports.getProfile = (req, res, next) => {
  const userId = req.userId;
  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find user');
        error.statusCode = 404;
        throw error;
      }
      return user;
    })
    .then(result => {
      res.status(200).json({
        error: false,
        message: 'Fetched user profile successfully!',
        profile: {
          _id: result._id.toString(),
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          gender: result.gender,
          age: result.age,
        },
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postProfile = (req, res, next) => {
  const userId = req.userId;
  console.log(req.body);
  const { email, firstName, lastName, gender, age } = req.body;
  User.findById(userId)
    .then(user => {
      if (!user) {
        const error = new Error('Could not find user');
        error.statusCode = 404;
        throw error;
      }

      if (
        user.email === email &&
        user.firstName === firstName &&
        user.lastName === lastName &&
        user.gender === gender &&
        user.age === age
      ) {
        res.status(304).json({ error: false, message: 'User not modified' });
      }

      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.gender = gender;
      user.age = age;
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        error: false,
        message: 'Saved profile information successfully!',
        profile: {
          _id: result._id.toString(),
          email: result.email,
          firstName: result.firstName,
          lastName: result.lastName,
          gender: result.gender,
          age: result.age,
        },
      });
      return result;
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
    .then(user => {
      if (user && typeof user.log === 'function') {
        const data = {
          action: 'update-user',
          category: 'users',
          createdBy: userId,
          message: 'Updated user name',
        };
        return user.log(data);
      }
    })
    .catch(err => {
      console.log('Caught error while logging: ', err);
    });
};

exports.patchChangePassword = (req, res, next) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  const validation = (userId, oldPassword, newPassword) => {
    if (!userId || !oldPassword || !newPassword) {
      const error = new Error('User ID not provided!');
      error.statusCode = 422;
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

    if (
      oldPassword.length > 30 ||
      oldPassword.length < 5 ||
      newPassword.length > 30 ||
      newPassword.length < 5
    ) {
      const error = new Error('Password format is invalid!');
      error.statusCode = 422;
      throw error;
    }
  };

  let foundUser;

  Promise.resolve()
    .then(() => validation(userId, oldPassword, newPassword))
    .then(() => User.findById(userId))
    .then(user => {
      if (!user) {
        const error = new Error('User does not exist');
        error.statusCode = 404;
        throw error;
      } else {
        foundUser = user;
        return bcrypt.compare(oldPassword, user.password);
      }
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Invalid password');
        error.statusCode = 401;
        throw error;
      } else {
        return bcrypt.hash(newPassword, 12);
      }
    })
    .then(hashedPw => {
      foundUser.password = hashedPw;
      return foundUser.save();
    })
    .then(savedUser => {
      foundUser = savedUser;
      return tokensUtil.createTokens(
        savedUser,
        config.secret + savedUser.password
      );
    })
    .then(([accessToken]) =>
      res.status(200).json({
        error: false,
        message: 'Successfully Changed User Password!',
        token: accessToken,
        userId: userId,
      })
    )
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
