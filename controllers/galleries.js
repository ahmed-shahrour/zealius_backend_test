const mongoose = require('mongoose');
const _ = require('lodash');
const createError = require('http-errors');

const Gallery = require('../models/gallery');

const galleryNotFoundError = createError(404, 'Could not find gallery.', {
  isOperational: true,
  isResSent: false,
});

//Dont forget to check if ObjectId provided is trueish

exports.getGalleries = (req, res, next) => {
  Gallery.find()
    .then(galleries => {
      if (!galleries) {
        throw galleryNotFoundError;
      }
      return galleries;
    })
    .then(result => {
      res.status(200).json({
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
        throw galleryNotFoundError;
      }
      return gallery;
    })
    .then(result => {
      res.status(200).json({
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
      throw createError(400, 'Required Info to create gallery not provided', {
        isOperational: true,
        isResSent: false,
      });
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
      throw createError(400, 'Required Info for array not provided', {
        isOperational: true,
        isResSent: false,
      });
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
      throw createError(400, 'Required Info to patch gallery not provided', {
        isOperational: true,
        isResSent: false,
      });
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Gallery.findById(galleryId))
    .then(foundGallery => {
      if (!foundGallery) {
        throw galleryNotFoundError;
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
      throw createError(400, 'Gallery ID not provided', {
        isOperational: true,
        isResSent: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(galleryId) ||
      !/^[a-fA-F0-9]{24}$/.test(galleryId)
    ) {
      throw createError(422, 'Gallery ID invalid', {
        isOperational: true,
        isResSent: false,
      });
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Gallery.findById(galleryId))
    .then(gallery => {
      if (!gallery) {
        throw galleryNotFoundError;
      } else if (gallery.exhibitions.length !== 0) {
        throw createError(403, 'Cannot delete a Gallery with exhibitions', {
          isOperational: true,
          isResSent: false,
        });
      } else {
        return Gallery.findByIdAndDelete(gallery._id);
      }
    })
    .then(deletedGallery =>
      res.json({
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
