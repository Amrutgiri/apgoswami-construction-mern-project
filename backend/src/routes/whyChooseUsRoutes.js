const express = require('express');
const {
  getAdminWhyChooseUs,
  getPublicWhyChooseUs,
  updateAdminWhyChooseUs,
  uploadWhyChooseImage,
} = require('../controllers/whyChooseUsController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadWhyChooseImageMulter = require('../middleware/uploadWhyChooseImage');

const router = express.Router();

const uploadWhyChooseImageHandler = (req, res, next) => {
  uploadWhyChooseImageMulter.single('whyChooseImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicWhyChooseUs);
router.get('/', verifyAdminToken, getAdminWhyChooseUs);
router.put('/', verifyAdminToken, updateAdminWhyChooseUs);
router.post('/upload', verifyAdminToken, uploadWhyChooseImageHandler, uploadWhyChooseImage);

module.exports = router;
