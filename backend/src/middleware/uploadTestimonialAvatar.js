const fs = require('fs');
const path = require('path');
const multer = require('multer');

const testimonialUploadDir = path.join(__dirname, '../../uploads/testimonials');

if (!fs.existsSync(testimonialUploadDir)) {
  fs.mkdirSync(testimonialUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, testimonialUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `testimonial-${Date.now()}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }
  cb(null, true);
};

const uploadTestimonialAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = uploadTestimonialAvatar;
