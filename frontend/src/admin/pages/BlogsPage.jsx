import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminDataTable from '../components/AdminDataTable';
import { confirmAction, toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';
import EditorJsField from '../components/EditorJsField';

const blogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Title is required')
    .max(180, 'Max 180 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  excerpt: z
    .string()
    .trim()
    .min(20, 'Excerpt is required')
    .max(300, 'Max 300 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  content: z
    .string()
    .trim()
    .min(40, 'Content is required')
    .max(20000, 'Max 20000 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  category: z
    .string()
    .trim()
    .min(2, 'Category is required')
    .max(80, 'Max 80 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  tags: z.string().trim().max(240, 'Max 240 characters'),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image is required')
    .refine((value) => /^https?:\/\/.+/i.test(value), 'Image URL must be valid http/https'),
  readMinutes: z.coerce.number().min(1, 'Minimum 1').max(60, 'Maximum 60'),
  publishDate: z.string().trim().min(1, 'Publish date is required'),
  sortOrder: z.coerce.number().min(0, 'Minimum 0').max(9999, 'Maximum 9999'),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

const defaultValues = {
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: '',
  imageUrl: '',
  readMinutes: 6,
  publishDate: new Date().toISOString().slice(0, 10),
  sortOrder: 0,
  isFeatured: false,
  isActive: true,
};

function BlogsPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(blogSchema),
    defaultValues,
  });

  const imageUrl = watch('imageUrl');
  const isEditMode = Boolean(editingId);

  const fetchBlogs = async () => {
    try {
      setIsTableLoading(true);
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load blogs');
        return;
      }

      setBlogs(Array.isArray(result.data) ? result.data : []);
    } catch {
      toastError('Unable to connect server. Please try again.');
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setEditingId('');
    setSelectedImage(null);
    reset(defaultValues);
  };

  const validateImage = (file) =>
    new Promise((resolve) => {
      if (!file?.type?.startsWith('image/')) {
        resolve({ ok: false, message: 'Please select an image file' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        resolve({ ok: false, message: 'Image size must be less than 10 MB' });
        return;
      }

      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        const width = image.width;
        const height = image.height;
        URL.revokeObjectURL(objectUrl);
        if (width < 1000 || height < 700) {
          resolve({ ok: false, message: 'Image resolution must be at least 1000x700' });
          return;
        }
        resolve({ ok: true });
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ ok: false, message: 'Invalid image file' });
      };
      image.src = objectUrl;
    });

  const onUploadImage = async () => {
    if (!selectedImage) {
      toastError('Please choose blog image first');
      return;
    }

    const check = await validateImage(selectedImage);
    if (!check.ok) {
      toastError(check.message);
      return;
    }

    try {
      setIsUploadingImage(true);
      const token = getAdminToken();
      const formData = new FormData();
      formData.append('blogImage', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/blogs/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.imageUrl) {
        toastError(result?.message || 'Failed to upload blog image');
        return;
      }

      setValue('imageUrl', result.data.imageUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('Blog image uploaded');
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const url = isEditMode ? `${API_BASE_URL}/api/blogs/${editingId}` : `${API_BASE_URL}/api/blogs`;
      const method = isEditMode ? 'PUT' : 'POST';

      const payload = {
        ...values,
        tags: values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save blog');
        return;
      }

      toastSuccess(isEditMode ? 'Blog updated successfully' : 'Blog created successfully');
      resetForm();
      fetchBlogs();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setSelectedImage(null);
    reset({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      category: item.category || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      imageUrl: item.imageUrl || '',
      readMinutes: Number(item.readMinutes || 6),
      publishDate: item.publishDate ? new Date(item.publishDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      sortOrder: Number(item.sortOrder || 0),
      isFeatured: Boolean(item.isFeatured),
      isActive: Boolean(item.isActive),
    });
  };

  const onDelete = async (item) => {
    const confirmed = await confirmAction({
      title: 'Delete blog?',
      text: `"${item.title}" will be removed permanently.`,
      confirmText: 'Yes, delete',
    });
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/blogs/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to delete blog');
        return;
      }

      if (editingId === item._id) {
        resetForm();
      }
      toastSuccess('Blog deleted successfully');
      fetchBlogs();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const rows = useMemo(
    () =>
      blogs.map((item, index) => ({
        id: item._id,
        srNo: index + 1,
        title: item.title,
        category: item.category,
        date: item.publishDate ? new Date(item.publishDate).toLocaleDateString() : '-',
        featured: item.isFeatured ? 'Yes' : 'No',
        status: item.isActive ? 'Active' : 'Inactive',
        order: item.sortOrder ?? 0,
        imageUrl: item.imageUrl,
        actions: item,
      })),
    [blogs],
  );

  const columns = [
    { key: 'srNo', label: '#', sortable: true },
    {
      key: 'imageUrl',
      label: 'Image',
      render: (value, row) => (
        <img
          src={value}
          alt={row.title}
          className="rounded border"
          style={{ width: '76px', height: '52px', objectFit: 'cover' }}
        />
      ),
    },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'date', label: 'Publish Date', sortable: true },
    { key: 'featured', label: 'Featured', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <span className={`admin-badge ${value === 'Active' ? 'seen' : 'unseen'}`}>{value}</span>,
    },
    { key: 'order', label: 'Order', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => onEdit(row.actions)}>
            Edit
          </button>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete(row.actions)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <section className="admin-card">
        <div className="admin-card-head">
          <h2>{isEditMode ? 'Edit Blog' : 'Add Blog'}</h2>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="admin-field-full">
            <label className="form-label">Title</label>
            <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} {...register('title')} />
            {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
          </div>

          <div>
            <label className="form-label">Category</label>
            <input className={`form-control ${errors.category ? 'is-invalid' : ''}`} {...register('category')} />
            {errors.category && <div className="invalid-feedback d-block">{errors.category.message}</div>}
          </div>

          <div>
            <label className="form-label">Publish Date</label>
            <input type="date" className={`form-control ${errors.publishDate ? 'is-invalid' : ''}`} {...register('publishDate')} />
            {errors.publishDate && <div className="invalid-feedback d-block">{errors.publishDate.message}</div>}
          </div>

          <div>
            <label className="form-label">Read Minutes</label>
            <input type="number" className={`form-control ${errors.readMinutes ? 'is-invalid' : ''}`} {...register('readMinutes')} />
            {errors.readMinutes && <div className="invalid-feedback d-block">{errors.readMinutes.message}</div>}
          </div>

          <div>
            <label className="form-label">Sort Order</label>
            <input type="number" className={`form-control ${errors.sortOrder ? 'is-invalid' : ''}`} {...register('sortOrder')} />
            {errors.sortOrder && <div className="invalid-feedback d-block">{errors.sortOrder.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Excerpt</label>
            <textarea className={`form-control ${errors.excerpt ? 'is-invalid' : ''}`} rows={2} {...register('excerpt')} />
            {errors.excerpt && <div className="invalid-feedback d-block">{errors.excerpt.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Content</label>
            <Controller
              control={control}
              name="content"
              render={({ field }) => (
                <EditorJsField value={field.value} onChange={field.onChange} error={Boolean(errors.content)} />
              )}
            />
            {errors.content && <div className="invalid-feedback d-block">{errors.content.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Tags (comma separated)</label>
            <input className={`form-control ${errors.tags ? 'is-invalid' : ''}`} placeholder="planning, quality, execution" {...register('tags')} />
            {errors.tags && <div className="invalid-feedback d-block">{errors.tags.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Image URL</label>
            <input className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} {...register('imageUrl')} />
            {errors.imageUrl && <div className="invalid-feedback d-block">{errors.imageUrl.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Upload Image (min 1000x700, max 10MB)</label>
            <div className="d-flex flex-column flex-md-row gap-2 align-items-start">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
              />
              <button type="button" className="btn btn-outline-primary" onClick={onUploadImage} disabled={isUploadingImage}>
                {isUploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
            {selectedImage && <small className="text-muted d-block mt-1">Selected: {selectedImage.name}</small>}
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Blog preview" className="img-fluid rounded border" style={{ maxHeight: '180px', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="admin-field-full d-flex gap-4">
            <div className="form-check">
              <input id="blogFeatured" type="checkbox" className="form-check-input" {...register('isFeatured')} />
              <label htmlFor="blogFeatured" className="form-check-label">
                Featured post
              </label>
            </div>
            <div className="form-check">
              <input id="blogIsActive" type="checkbox" className="form-check-input" {...register('isActive')} />
              <label htmlFor="blogIsActive" className="form-check-label">
                Active (show on frontend)
              </label>
            </div>
          </div>

          <div className="admin-form-actions d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Blog' : 'Add Blog'}
            </button>
            {isEditMode && (
              <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <AdminDataTable
        title={isTableLoading ? 'Blogs Table (Loading...)' : 'Blogs Table'}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search by title/category..."
      />
    </>
  );
}

export default BlogsPage;
