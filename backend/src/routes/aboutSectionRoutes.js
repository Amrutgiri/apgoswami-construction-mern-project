const express = require('express');
const {
  getAdminAboutSection,
  updateAdminAboutSection,
  getPublicAboutSection,
  uploadAboutImage,
  updateAboutImageOnly,
} = require('../controllers/aboutSectionController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadAboutImageMulter = require('../middleware/uploadAboutImage');

const router = express.Router();

const uploadAboutImageHandler = (req, res, next) => {
  uploadAboutImageMulter.single('aboutImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicAboutSection);
router.get('/', verifyAdminToken, getAdminAboutSection);
router.put('/', verifyAdminToken, updateAdminAboutSection);
router.patch('/image', verifyAdminToken, updateAboutImageOnly);
router.post('/upload', verifyAdminToken, uploadAboutImageHandler, uploadAboutImage);

module.exports = router;
