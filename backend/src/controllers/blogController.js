const fs = require('fs');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Blog = require('../models/Blog');

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;
const uploadsBlogsSegment = '/uploads/blogs/';

const sanitize = (value) => String(value ?? '').trim();
const isValidImageUrl = (value) => /^https?:\/\/.+/i.test(value);
const safeTextSlug = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const safeDeleteLocalImageByUrl = (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes(uploadsBlogsSegment)) {
      return;
    }

    const fileName = imageUrl.split(uploadsBlogsSegment)[1];
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      return;
    }

    const filePath = `uploads/blogs/${fileName}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore cleanup errors.
  }
};

const buildUniqueSlug = async (title, excludeId = '') => {
  const base = safeTextSlug(title) || `blog-${Date.now()}`;
  let candidate = base;
  let index = 1;

  while (true) {
    const existing = await Blog.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select('_id')
      .lean();

    if (!existing) {
      return candidate;
    }

    candidate = `${base}-${index}`;
    index += 1;
  }
};

const validatePayload = async (payload, excludeId = '') => {
  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((tag) => sanitize(tag)).filter(Boolean)
    : sanitize(payload.tags)
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  const data = {
    title: sanitize(payload.title),
    excerpt: sanitize(payload.excerpt),
    content: sanitize(payload.content),
    category: sanitize(payload.category),
    tags: tags.slice(0, 15),
    imageUrl: sanitize(payload.imageUrl),
    readMinutes: Number.isFinite(Number(payload.readMinutes)) ? Number(payload.readMinutes) : 6,
    publishDate: sanitize(payload.publishDate),
    isFeatured: Boolean(payload.isFeatured),
    isActive: typeof payload.isActive === 'boolean' ? payload.isActive : true,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 0,
  };

  if (!data.title || data.title.length > 180) {
    return { ok: false, message: 'Title is required and must be max 180 characters' };
  }
  if (!data.excerpt || data.excerpt.length > 300) {
    return { ok: false, message: 'Excerpt is required and must be max 300 characters' };
  }
  if (!data.content || data.content.length < 40 || data.content.length > 20000) {
    return { ok: false, message: 'Content is required and must be between 40 and 20000 characters' };
  }
  if (!data.category || data.category.length > 80) {
    return { ok: false, message: 'Category is required and must be max 80 characters' };
  }
  if (!data.imageUrl || !isValidImageUrl(data.imageUrl)) {
    return { ok: false, message: 'Blog image is required and must be valid http/https URL' };
  }
  if (data.readMinutes < 1 || data.readMinutes > 60) {
    return { ok: false, message: 'Read minutes must be between 1 and 60' };
  }
  if (!data.publishDate || Number.isNaN(Date.parse(data.publishDate))) {
    return { ok: false, message: 'Publish date is required and must be valid date' };
  }
  if (data.sortOrder < 0 || data.sortOrder > 9999) {
    return { ok: false, message: 'Sort order must be between 0 and 9999' };
  }
  if (
    scriptTagRegex.test(data.title) ||
    scriptTagRegex.test(data.excerpt) ||
    scriptTagRegex.test(data.content) ||
    scriptTagRegex.test(data.category) ||
    data.tags.some((tag) => scriptTagRegex.test(tag))
  ) {
    return { ok: false, message: 'Scripting tags are not allowed' };
  }

  const slug = await buildUniqueSlug(data.title, excludeId);

  return {
    ok: true,
    data: {
      ...data,
      slug,
      publishDate: new Date(data.publishDate),
    },
  };
};

const serializeBlog = (blog) => ({
  _id: blog._id,
  title: blog.title,
  slug: blog.slug,
  excerpt: blog.excerpt,
  content: blog.content,
  category: blog.category,
  tags: blog.tags || [],
  imageUrl: blog.imageUrl,
  readMinutes: blog.readMinutes,
  publishDate: blog.publishDate,
  isFeatured: blog.isFeatured,
  isActive: blog.isActive,
  sortOrder: blog.sortOrder,
  updatedAt: blog.updatedAt,
});

const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ sortOrder: 1, publishDate: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: blogs.map(serializeBlog),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message,
    });
  }
};

const getPublicBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isActive: true }).sort({ sortOrder: 1, publishDate: -1 }).lean();
    return res.status(200).json({
      success: true,
      data: blogs.map(serializeBlog),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message,
    });
  }
};

const getPublicBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug, isActive: true }).lean();
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    return res.status(200).json({
      success: true,
      data: serializeBlog(blog),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blog details',
      error: error.message,
    });
  }
};

const createBlog = async (req, res) => {
  try {
    const validation = await validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const created = await Blog.create(validation.data);
    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: serializeBlog(created.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }

    const existing = await Blog.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const validation = await validatePayload(req.body, id);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const updated = await Blog.findByIdAndUpdate(id, validation.data, { new: true }).lean();
    if (existing.imageUrl && existing.imageUrl !== validation.data.imageUrl) {
      safeDeleteLocalImageByUrl(existing.imageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: serializeBlog(updated),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }

    const deleted = await Blog.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    safeDeleteLocalImageByUrl(deleted.imageUrl);
    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message,
    });
  }
};

const uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Blog image file is required' });
    }

    const metadata = await sharp(req.file.path).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (width < 1000 || height < 700) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image resolution must be at least 1000x700',
      });
    }

    const baseUrl = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/blogs/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Blog image uploaded successfully',
      data: { imageUrl, width, height },
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to upload blog image',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminBlogs,
  getPublicBlogs,
  getPublicBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadBlogImage,
};
