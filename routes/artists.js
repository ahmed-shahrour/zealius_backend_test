const express = require('express');

const artistsController = require('../controllers/artists');
const checkAdminToken = require('../middlewares/checkAdminToken');

const router = express.Router();

router.get('/', artistsController.getArtists);
router.get('/:artistId', artistsController.getSelectedArtist);

router.post('/new', checkAdminToken, artistsController.postArtist);

router.patch('/update', checkAdminToken, artistsController.patchArtist);

router.delete(
  '/delete/:artistId',
  checkAdminToken,
  artistsController.deleteArtist
);

module.exports = router;
