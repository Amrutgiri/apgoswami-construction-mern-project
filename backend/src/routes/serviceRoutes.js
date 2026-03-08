const express = require('express');
const {
  getAdminServices,
  getPublicServices,
  createService,
  updateService,
  deleteService,
  uploadServiceImage,
} = require('../controllers/serviceController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadServiceImageMulter = require('../middleware/uploadServiceImage');

const router = express.Router();

const uploadServiceImageHandler = (req, res, next) => {
  uploadServiceImageMulter.single('serviceImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicServices);
router.get('/', verifyAdminToken, getAdminServices);
router.post('/', verifyAdminToken, createService);
router.put('/:id', verifyAdminToken, updateService);
router.delete('/:id', verifyAdminToken, deleteService);
router.post('/upload', verifyAdminToken, uploadServiceImageHandler, uploadServiceImage);

module.exports = router;
