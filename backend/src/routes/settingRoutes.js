const express = require('express');
const {
  getAdminSettings,
  upsertSettings,
  getPublicSettings,
} = require('../controllers/settingController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/public', getPublicSettings);
router.get('/', verifyAdminToken, getAdminSettings);
router.put('/', verifyAdminToken, upsertSettings);

module.exports = router;
