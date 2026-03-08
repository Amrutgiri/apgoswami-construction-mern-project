const express = require('express');
const {
  getAdminBlogs,
  getPublicBlogs,
  getPublicBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
} = require('../controllers/blogController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const uploadBlogImageMulter = require('../middleware/uploadBlogImage');

const router = express.Router();

const uploadBlogImageHandler = (req, res, next) => {
  uploadBlogImageMulter.single('blogImage')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Invalid file upload',
      });
    }
    return next();
  });
};

router.get('/public', getPublicBlogs);
router.get('/public/:slug', getPublicBlogBySlug);
router.get('/', verifyAdminToken, getAdminBlogs);
router.post('/', verifyAdminToken, createBlog);
router.put('/:id', verifyAdminToken, updateBlog);
router.delete('/:id', verifyAdminToken, deleteBlog);
router.post('/upload', verifyAdminToken, uploadBlogImageHandler, uploadBlogImage);

module.exports = router;
