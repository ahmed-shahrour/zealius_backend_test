const express = require('express');

const galleriesController = require('../controllers/galleries');
const checkAdminToken = require('../middlewares/checkAdminToken');

const router = express.Router();

router.get('/', checkAdminToken, galleriesController.getGalleries);
router.get('/:galleryId', galleriesController.getSelectedGallery);

router.post('/new', checkAdminToken, galleriesController.postGallery);

router.patch(
  '/update/:galleryId',
  checkAdminToken,
  galleriesController.patchGallery
);

router.delete(
  '/delete/:galleryId',
  checkAdminToken,
  galleriesController.deleteGallery
);

module.exports = router;
