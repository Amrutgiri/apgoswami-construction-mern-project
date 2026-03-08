const express = require('express');
const {
  getAdminHero,
  updateAdminHero,
  getPublicHero,
  uploadHeroImage,
  updateHeroImageOnly,
} = require('../controllers/homeHeroController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadHeroImageMulter = require('../middleware/uploadHeroImage');

const router = express.Router();

const uploadHeroImageHandler = (req, res, next) => {
  uploadHeroImageMulter.single('heroImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicHero);
router.get('/', verifyAdminToken, getAdminHero);
router.put('/', verifyAdminToken, updateAdminHero);
router.patch('/image', verifyAdminToken, updateHeroImageOnly);
router.post('/upload', verifyAdminToken, uploadHeroImageHandler, uploadHeroImage);

module.exports = router;
