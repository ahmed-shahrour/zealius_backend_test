const express = require('express');

const exhibitionsController = require('../controllers/exhibitions');
const checkAdminToken = require('../middlewares/checkAdminToken');

const router = express.Router();

router.get('/', exhibitionsController.getExhibitions);
router.get('/:exhibitionId', exhibitionsController.getSelectedExhibition);

router.post('/new', checkAdminToken, exhibitionsController.postExhibition);

router.patch('/update/:exhibitionId', checkAdminToken, exhibitionsController.patchExhibition);

router.delete(
  '/delete/:exhibitionId',
  checkAdminToken,
  exhibitionsController.deleteExhibition
);

module.exports = router;
