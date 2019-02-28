const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');
const createError = require('http-errors');

const Exhibition = require('../models/exhibition');
const Gallery = require('../models/gallery');
const Artist = require('../models/artist');

const exhibitionNotFoundError = createError(404, 'Could not find exhibition.', {
  isOperational: true,
  isResSent: false,
});
const galleryNotFoundError = createError(404, 'Could not find gallery.', {
  isOperational: true,
  isResSent: false,
});
const artistNotFoundError = createError(404, 'Could not find artist.', {
  isOperational: true,
  isResSent: false,
});

exports.getExhibitions = (req, res, next) => {
  const isRefresh = req.query.refresh == 'true';
  const currentPage = Number(req.query.page) || 1;
  const perPage = 8;

  Exhibition.find()
    .countDocuments()
    .then(count => {
      if (isRefresh) {
        return Exhibition.find()
          .limit(perPage * currentPage)
          .populate('galleries', 'name')
          .populate('artists', 'name')
          .lean();
        //check lean
      } else {
        return Exhibition.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage)
          .populate('galleries', 'name')
          .populate('artists', 'name')
          .lean();
        //check lean
      }
    })
    .then(exhibitions => {
      if (!exhibitions) {
        throw exhibitionNotFoundError;
      }
      return res.status(200).json({
        message: 'Fetched exhibitions successfully',
        exhibitions: exhibitions,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSelectedExhibition = (req, res, next) => {
  const exhibitionId = req.params.exhibitionId;

  Exhibition.findById(exhibitionId)
    .populate('galleries', 'name')
    .populate('artists', 'name')
    .lean()
    // check lean
    .then(exhibition => {
      if (!exhibition) {
        throw exhibitionNotFoundError;
      }
      return res.status(200).json({
        message: 'Fetched selected exhibition successfully!',
        exhibition: exhibition,
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postExhibition = (req, res, next) => {
  const { title, galleries, artists, startDate, endDate } = req.body;

  const validation = (title, galleries, artists, startDate, endDate) => {
    // All fields must be provided in the parameters
    if (!title || !galleries || !artists || !startDate || !endDate) {
      throw createError(
        400,
        'Required Info to update exhibition not provided.',
        {
          isOperational: true,
          isResSent: false,
        }
      );
    }

    // Ensure endDate and startDate is in correct format
    if (
      endDate.length !== 10 ||
      endDate.split('-').length !== 3 ||
      startDate.length !== 10 ||
      startDate.split('-').length !== 3 ||
      !moment(endDate, 'YYYY-MM-DD', true).isValid() ||
      !moment(startDate, 'YYYY-MM-DD', true).isValid()
    ) {
      throw createError(422, 'endDate and startDate are invalid', {
        isOperational: true,
        isResSent: false,
      });
    }

    // Ensure endDate > startDate
    if (moment(endDate).isBefore(startDate)) {
      throw createError(422, 'endDate is before startDate', {
        isOperational: true,
        isResSent: false,
      });
    }

    // Ensure galleries and artists arrays are not too long, or else someone can fuck the database with too many writes.
    if (
      galleries.length > 50 ||
      galleries.length === 0 ||
      artists.length > 50 ||
      artists.length === 0
    ) {
      throw createError(422, 'Number of Ids provided is invalid', {
        isOperational: true,
        isResSent: false,
      });
    }
    // Ensure gallery ids in array provided looks truthy and is actually available in the database
    for (let i = 0; i < galleries.length; i++) {
      if (
        mongoose.Types.ObjectId.isValid(galleries[i]) &&
        /^[a-fA-F0-9]{24}$/.test(galleries[i])
      ) {
        Gallery.findById(galleries[i])
          .then(foundGallery => {
            if (!foundGallery) {
              throw galleryNotFoundError;
            }
            return foundGallery;
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        throw createError(400, 'Invalid gallery ID', {
          isOperational: true,
          isResSent: false,
        });
      }
    }

    // Ensure artist ids in array provided looks truthy and is actually available in the database
    for (let i = 0; i < artists.length; i++) {
      if (
        mongoose.Types.ObjectId.isValid(artists[i]) &&
        /^[a-fA-F0-9]{24}$/.test(artists[i])
      ) {
        Artist.findById(artists[i])
          .then(foundArtist => {
            if (!foundArtist) {
              throw artistNotFoundError;
            }
            return foundArtist;
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        throw createError(400, 'Invalid artist ID', {
          isOperational: true,
          isResSent: false,
        });
      }
    }
  };

  let exhibition;

  Promise.resolve()
    .then(() => validation(title, galleries, artists, startDate, endDate))
    .then(() => {
      return (exhibition = new Exhibition({
        title,
        galleries,
        artists,
        startDate,
        endDate,
      }));
    })
    .then(() => {
      // Checking if gallery provided exists and then I update the gallery's exhibitions array
      const galleryArrayUpdate = () => {
        for (let i = 0; i < galleries.length; i++) {
          Gallery.findById(galleries[i]._id)
            .then(gallery => {
              if (!gallery) {
                throw galleryNotFoundError;
              } else {
                gallery.exhibitions.push(exhibition);
                return gallery.save();
              }
            })
            .catch(error => {
              throw error;
            });
        }
      };

      // Checking if artist provided exists and then I update the artist's exhibitions array
      const artistArrayUpdate = () => {
        for (let i = 0; i < artists.length; i++) {
          Artist.findById(artists[i]._id)
            .then(artist => {
              if (!artist) {
                throw artistNotFoundError;
              } else {
                artist.exhibitions.push(exhibition);
                return artist.save();
              }
            })
            .catch(error => {
              throw error;
            });
        }
      };

      galleryArrayUpdate();
      artistArrayUpdate();
      return exhibition.save();
    })
    .then(() => {
      res
        .status(201)
        .json({ message: 'Exhibition Created!', exhibitionId: exhibition._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.patchExhibition = (req, res, next) => {
  const { _id, title, galleries, artists, startDate, endDate } = req.body;
  const exhibitionId = req.params.exhibitionId;
  const userId = req.body.userId;

  const validation = (_id, title, galleries, artists, startDate, endDate) => {
    // All fields must be provided in the parameters
    if (
      !exhibitionId ||
      !req.body ||
      (!title && !galleries && !artists && !startDate && !endDate)
    ) {
      throw createError(
        400,
        'Required Info to update exhibition not provided',
        { isOperational: true, isResSent: false }
      );
    }

    // Ensure exhibition id looks truthy
    if (
      !mongoose.Types.ObjectId.isValid(exhibitionId) ||
      !/^[a-fA-F0-9]{24}$/.test(exhibitionId)
    ) {
      throw createError(400, 'Exhibition ID invalid', {
        isOperational: true,
        isResSent: false,
      });
    }

    // Ensure endDate and startDate is in correct format

    if (
      endDate.length !== 10 ||
      endDate.split('-').length !== 3 ||
      startDate.length !== 10 ||
      startDate.split('-').length !== 3 ||
      !moment(endDate, 'YYYY-MM-DD', true).isValid() ||
      !moment(startDate, 'YYYY-MM-DD', true).isValid()
    ) {
      throw createError(422, 'endDate and startDate are invalid', {
        isOperational: true,
        isResSent: false,
      });
    }

    // Ensure endDate > startDate
    if (moment(endDate).isBefore(startDate)) {
      throw createError(422, 'endDate and startDate are invalid', {
        isOperational: true,
        isResSent: false,
      });
    }

    // Ensure galleries and artists arrays are not too long, or else someone can fuck the database with too many writes.
    if (
      galleries.length > 50 ||
      galleries.length === 0 ||
      artists.length > 50 ||
      artists.length === 0
    ) {
      throw createError(422, 'Number of Ids provided is invalid', {
        isOperational: true,
        isResSent: false,
      });
    }

    // Ensure gallery ids in array provided looks truthy and is actually available in the database
    for (let i = 0; i < galleries.length; i++) {
      if (
        mongoose.Types.ObjectId.isValid(galleries[i]) &&
        /^[a-fA-F0-9]{24}$/.test(galleries[i])
      ) {
        Gallery.findById(galleries[i])
          .then(foundGallery => {
            if (!foundGallery) {
              throw galleryNotFoundError;
            }
            return foundGallery;
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        throw createError(400, 'Invalid gallery ID', {
          isOperational: true,
          isResSent: false,
        });
      }
    }

    // Ensure artist ids in array provided looks truthy and is actually available in the database
    for (let i = 0; i < artists.length; i++) {
      if (
        mongoose.Types.ObjectId.isValid(artists[i]) &&
        /^[a-fA-F0-9]{24}$/.test(artists[i])
      ) {
        Artist.findById(artists[i])
          .then(foundArtist => {
            if (!foundArtist) {
              throw artistNotFoundError;
            }
            return foundArtist;
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      } else {
        throw createError(400, 'Invalid artist ID', {
          isOperational: true,
          isResSent: false,
        });
      }
    }
  };

  const exhibitionPullAndPush = (model, oldArray, newArray, exhibitionId) => {
    const arrayIdsToRemoveExhibition = _.difference(oldArray, newArray);
    const arrayIdsToAddExhibition = _.difference(newArray, oldArray);

    for (let i = 0; i < arrayIdsToRemoveExhibition.length; i++) {
      model
        .findById(arrayIdsToRemoveExhibition[i])
        .then(foundDoc => {
          if (!foundDoc) {
            throw createError(
              404,
              `${arrayIdsToRemoveExhibition[i]} does not exist for pulling`,
              { isOperational: true, isResSent: false }
            );
          } else {
            foundDoc.exhibitions.splice(
              foundDoc.exhibitions.indexOf(exhibitionId),
              1
            );
            return foundDoc.save();
          }
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }

    for (let i = 0; i < arrayIdsToAddExhibition.length; i++) {
      model
        .findById(arrayIdsToAddExhibition[i])
        .then(foundDoc => {
          if (!foundDoc) {
            throw createError(
              404,
              `${arrayIdsToAddExhibition[i]} does not exist for pushing`,
              { isOperational: true, isResSent: false }
            );
          } else {
            foundDoc.exhibitions.push(exhibitionId);
            return foundDoc.save();
          }
        })
        .catch(err => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });
    }

    return;
  };

  let oldExhibition;

  Promise.resolve()
    .then(() => validation(_id, title, galleries, artists, startDate, endDate))
    .then(() => Exhibition.findById(_id))
    .then(foundExhibition => {
      if (!foundExhibition) {
        throw exhibitionNotFoundError;
      } else {
        return (oldExhibition = foundExhibition);
      }
    })
    .then(() => {
      const oldExhGalleryStr = oldExhibition.galleries.map(gallery =>
        gallery.toString()
      );
      const oldExhArtistsStr = oldExhibition.artists.map(artist =>
        artist.toString()
      );
      exhibitionPullAndPush(Gallery, oldExhGalleryStr, galleries, _id);
      exhibitionPullAndPush(Artist, oldExhArtistsStr, artists, _id);
      oldExhibition.title = title;
      oldExhibition.galleries = galleries;
      oldExhibition.artists = artists;
      oldExhibition.startDate = startDate;
      oldExhibition.endDate = endDate;
      return oldExhibition.save();
    })
    .then(() =>
      res.status(200).json({
        message: 'Successfully updated the exhibition and other dependencies',
        exhibitionId: _id,
      })
    )
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteExhibition = (req, res, next) => {
  const exhibitionId = req.params.exhibitionId;

  const validation = id => {
    //Check if exhibitionId is provided
    if (!exhibitionId) {
      throw createError(400, 'Exhibition ID not provided', {
        isOperational: true,
        isResSent: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !/^[a-fA-F0-9]{24}$/.test(id)) {
      throw createError(400, 'Exhibition ID invalid', {
        isOperational: true,
        isResSent: false,
      });
    }
  };

  let deleteExhibitionObj;

  Promise.resolve()
    .then(() => validation(exhibitionId))
    .then(() => Exhibition.findById(exhibitionId))
    .then(foundExhibition => {
      if (!foundExhibition) {
        throw exhibitionNotFoundError;
      } else {
        return (deleteExhibitionObj = foundExhibition);
      }
    })
    .then(() => {
      const deletion = () => {
        for (let i = 0; i < deleteExhibitionObj.galleries.length; i++) {
          Gallery.findById(deleteExhibitionObj.galleries[i])
            .then(foundGallery => {
              const foundGalExhStr = foundGallery.exhibitions.map(exh =>
                exh.toString()
              );
              foundGalExhStr.splice(foundGalExhStr.indexOf(exhibitionId), 1);
              foundGallery.exhibitions = foundGalExhStr;
              return foundGallery.save();
            })
            .catch(err => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        }

        for (let i = 0; i < deleteExhibitionObj.artists.length; i++) {
          Artist.findById(deleteExhibitionObj.artists[i])
            .then(foundArtist => {
              const foundArtExhStr = foundArtist.exhibitions.map(exh =>
                exh.toString()
              );
              foundArtExhStr.splice(foundArtExhStr.indexOf(exhibitionId), 1);
              foundArtist.exhibitions = foundArtExhStr;
              return foundArtist.save();
            })
            .catch(err => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
        }

        Exhibition.findByIdAndDelete(exhibitionId)
          .then(() => {
            res.status(200).json({
              message:
                'Successfully deleted exhibition and updated relevant dependancies!',
              exhibitionId: exhibitionId,
            });
          })
          .catch(err => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      };

      return deletion();
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
