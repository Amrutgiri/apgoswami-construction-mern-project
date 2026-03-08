const express = require('express');
const {
  getAdminProjects,
  getPublicProjects,
  createProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
} = require('../controllers/projectController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadProjectImageMulter = require('../middleware/uploadProjectImage');

const router = express.Router();

const uploadProjectImageHandler = (req, res, next) => {
  uploadProjectImageMulter.single('projectImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicProjects);
router.get('/', verifyAdminToken, getAdminProjects);
router.post('/', verifyAdminToken, createProject);
router.put('/:id', verifyAdminToken, updateProject);
router.delete('/:id', verifyAdminToken, deleteProject);
router.post('/upload', verifyAdminToken, uploadProjectImageHandler, uploadProjectImage);

module.exports = router;
