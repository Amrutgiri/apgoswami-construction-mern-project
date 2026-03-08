const express = require('express');
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
} = require('../controllers/inquiryController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createInquiry);
router.get('/', verifyAdminToken, getInquiries);
router.patch('/:id/status', verifyAdminToken, updateInquiryStatus);

module.exports = router;
