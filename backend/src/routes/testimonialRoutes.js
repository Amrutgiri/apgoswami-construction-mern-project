const express = require('express');
const {
  getAdminTestimonials,
  getPublicTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  uploadTestimonialAvatar,
} = require('../controllers/testimonialController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadTestimonialAvatarMulter = require('../middleware/uploadTestimonialAvatar');

const router = express.Router();

const uploadTestimonialAvatarHandler = (req, res, next) => {
  uploadTestimonialAvatarMulter.single('avatar')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicTestimonials);
router.get('/', verifyAdminToken, getAdminTestimonials);
router.post('/', verifyAdminToken, createTestimonial);
router.put('/:id', verifyAdminToken, updateTestimonial);
router.delete('/:id', verifyAdminToken, deleteTestimonial);
router.post('/upload', verifyAdminToken, uploadTestimonialAvatarHandler, uploadTestimonialAvatar);

module.exports = router;
