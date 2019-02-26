const mongoose = require('mongoose');
const _ = require('lodash');

const Gallery = require('../models/gallery');

//Dont forget to check if ObjectId provided is trueish

exports.getGalleries = (req, res, next) => {
  Gallery.find()
    .then(galleries => {
      if (!galleries) {
        const error = new Error('Could not find galleries.');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
      return galleries;
    })
    .then(result => {
      res.status(200).json({
        error: false,
        message: 'Fetched galleries successfully.',
        galleries: result,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSelectedGallery = (req, res, next) => {
  const galleryId = req.params.galleryId;
  Gallery.findById(galleryId)
    .then(gallery => {
      if (!gallery) {
        const error = new Error('Could not find gallery.');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
      return gallery;
    })
    .then(result => {
      res.status(200).json({
        error: false,
        message: 'Fetched selected gallery successfully!',
        gallery: result,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postGallery = (req, res, next) => {
  const { name, location, contact, description } = req.body;

  const validation = () => {
    if (!name || !location || !contact || !description) {
      const error = new Error('Required Info to create gallery not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    const locationProperties = [
      'area',
      'title',
      'street',
      'unit',
      'latitude',
      'longitude',
    ];
    const contactProperties = ['phone', 'email'];

    const propertyValidation = (obj, properties) => {
      let isValid = true;
      for (let i = 0; i < properties.length; i++) {
        isValid = isValid && obj.hasOwnProperty(properties[i]);
      }
      return isValid;
    };

    if (
      !propertyValidation(location, locationProperties) ||
      !propertyValidation(contact, contactProperties)
    ) {
      const error = new Error('Required Info for array not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => {
      const gallery = new Gallery({
        name,
        location,
        contact,
        description,
      });

      return gallery.save();
    })
    .then(gal => {
      res.status(201).json({ message: 'Gallery Created!', galleryId: gal._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.patchGallery = (req, res, next) => {
  const galleryId = req.params.galleryId;
  const userId = req.userId;

  const validation = () => {
    if (
      !galleryId ||
      !req.body ||
      (!req.body.name &&
        !req.body.location &&
        !req.body.contact &&
        !req.body.description)
    ) {
      const error = new Error('Required Info to patch gallery not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Gallery.findById(galleryId))
    .then(foundGallery => {
      if (!foundGallery) {
        const error = new Error('Gallery not found');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else {
        for (let i in req.body) {
          if (!_.isEqual(foundGallery[i], req.body[i])) {
            foundGallery[i] = req.body[i];
          }
        }
        return foundGallery.save();
      }
    })
    .then(gall => {
      res
        .status(200)
        .json({ message: 'Gallery Updated!', galleryId: galleryId });
      return gall;
    })
    .then(gallery => {
      if (gallery && typeof gallery.log === 'function') {
        const data = {
          action: 'update-gallery',
          category: 'galleries',
          createdBy: userId,
          message: 'Updated gallery fields',
        };
        return gallery.log(data);
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteGallery = (req, res, next) => {
  const galleryId = req.params.galleryId;

  const validation = () => {
    if (!galleryId) {
      const error = new Error('Gallery ID not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    if (
      !mongoose.Types.ObjectId.isValid(galleryId) ||
      !/^[a-fA-F0-9]{24}$/.test(galleryId)
    ) {
      const error = new Error('Gallery ID invalid!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Gallery.findById(galleryId))
    .then(gallery => {
      if (!gallery) {
        const error = new Error('Gallery does not exist!');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else if (gallery.exhibitions.length !== 0) {
        const error = new Error('Cannot Delete a Gallery with exhibitions!');
        error.statusCode = 403;
        error.isOperational = true;
        throw error;
      } else {
        return Gallery.findByIdAndDelete(gallery._id);
      }
    })
    .then(deletedGallery =>
      res.json({
        error: false,
        message: 'Successfully Deleted Gallery',
        galleryId: deletedGallery._id,
      })
    )
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
