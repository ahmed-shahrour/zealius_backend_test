const mongoose = require('mongoose');

const Artist = require('../models/artist');

//Dont forget to check if ObjectId provided is trueish

exports.getArtists = (req, res, next) => {
  Artist.find()
    .then(artists => {
      if (!artists) {
        const error = new Error('Could not find artists.');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
      return artists;
    })
    .then(result => {
      res.status(200).json({
        error: false,
        message: 'Fetched artists successfully.',
        artists: result,
      });
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
        const error = new Error('Could not find artist.');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      }
      return artist;
    })
    .then(result => {
      res.status(200).json({
        error: false,
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
      const error = new Error('Required Info to create artist not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
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
      res
        .status(201)
        .json({ error: false, message: 'Artist Created!', artistId: art._id });
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
      const error = new Error('Required Info to patch artist not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }
  };

  let artist;

  Promise.resolve()
    .then(() => validation())
    .then(() => Artist.findById(_id))
    .then(foundArtist => {
      if (!foundArtist) {
        const error = new Error('Artist not found');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else {
        return (artist = foundArtist);
      }
    })
    .then(() => (artist.name = name))
    .then(() => artist.save())
    .then(art => {
      res
        .status(200)
        .json({ error: false, message: 'Artist Updated!', artistId: art._id });
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
      const error = new Error('Artist ID not provided!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }

    if (
      !mongoose.Types.ObjectId.isValid(artistId) ||
      !/^[a-fA-F0-9]{24}$/.test(artistId)
    ) {
      const error = new Error('Artist ID invalid!');
      error.statusCode = 422;
      error.isOperational = true;
      throw error;
    }
  };

  Promise.resolve()
    .then(() => validation())
    .then(() => Artist.findById(artistId))
    .then(artist => {
      if (!artist) {
        const error = new Error('Artist does not exist!');
        error.statusCode = 404;
        error.isOperational = true;
        throw error;
      } else if (artist.exhibitions.length !== 0) {
        const error = new Error('Cannot Delete an Artist with exhibitions!');
        error.statusCode = 403;
        error.isOperational = true;
        throw error;
      } else {
        return artist;
      }
    })
    .then(foundArtist => Artist.findByIdAndDelete(foundArtist._id))
    .then(deletedArtist =>
      res.json({
        error: false,
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
