const express = require('express');
const {
  getAdminContactPageContent,
  getPublicContactPageContent,
  updateAdminContactPageContent,
} = require('../controllers/contactPageContentController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public', getPublicContactPageContent);
router.get('/', verifyAdminToken, getAdminContactPageContent);
router.put('/', verifyAdminToken, updateAdminContactPageContent);

module.exports = router;
