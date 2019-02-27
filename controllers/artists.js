const mongoose = require('mongoose');
const createError = require('http-errors');

const Artist = require('../models/artist');

//Dont forget to check if ObjectId provided is trueish

const artistNotFoundError = createError(404, 'Could not find artist.', {
  isOperational: true,
  isResSent: false,
});

exports.getArtists = (req, res, next) => {
  Artist.find()
    .then(artists => {
      if (!artists) {
        throw createError(404, 'Could not find artists.', {
          isOperational: true,
          isResSent: false,
        });
      } else {
        return res.status(200).json({
          message: 'Fetched artists successfully.',
          artists: artists,
        });
      }
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSelectedArtist = (req, res, next) => {
  const artistId = req.params.artistId;
  Artist.findById(artistId)
    .then(artist => {
      if (!artist) {
        throw artistNotFoundError;
      }
      return artist;
    })
    .then(result => {
      res.status(200).json({
        message: 'Fetched selected artist successfully!',
        artist: result,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postArtist = (req, res, next) => {
  const { name } = req.body;

  const validation = () => {
    if (!name) {
      throw createError(400, 'Required Info to create artist not provided.', {
        isOperational: true,
        isResSent: false,
      });
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => {
      const artist = new Artist({
        name,
      });
      return artist.save();
    })
    .then(art => {
      res.status(201).json({ message: 'Artist Created!', artistId: art._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.patchArtist = (req, res, next) => {
  const { _id, name } = req.body;

  const validation = () => {
    if (!name || !_id) {
      throw createError(400, 'Required Info to patch artist not provided.', {
        isOperational: true,
        isResSent: false,
      });
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Artist.findById(_id))
    .then(foundArtist => {
      if (!foundArtist) {
        throw artistNotFoundError;
      } else {
        foundArtist.name = name;
        return foundArtist.save();
      }
    })
    .then(art => {
      res.status(200).json({ message: 'Artist Updated!', artistId: art._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteArtist = (req, res, next) => {
  const artistId = req.params.artistId;

  const validation = () => {
    if (!artistId) {
      throw createError(400, 'Artist ID not provided.', {
        isOperational: true,
        isResSent: false,
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(artistId) ||
      !/^[a-fA-F0-9]{24}$/.test(artistId)
    ) {
      throw createError(422, 'Artist ID is semantically invalid.', {
        isOperational: true,
        isResSent: false,
      });
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Artist.findById(artistId))
    .then(artist => {
      if (!artist) {
        throw artistNotFoundError;
      } else if (artist.exhibitions.length !== 0) {
        throw createError(403, 'Cannot Delete an Artist with exhibitions.', {
          isOperational: true,
          isResSent: false,
        });
      } else {
        return Artist.findByIdAndDelete(artist._id);
      }
    })
    .then(deletedArtist =>
      res.json({
        message: 'Successfully Deleted Artist',
        artistId: deletedArtist._id,
      })
    )
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
