import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminDataTable from '../components/AdminDataTable';
import { confirmAction, toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const testimonialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is required')
    .max(80, 'Max 80 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  role: z
    .string()
    .trim()
    .min(2, 'Role is required')
    .max(120, 'Max 120 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  text: z
    .string()
    .trim()
    .min(10, 'Message is required')
    .max(500, 'Max 500 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  rating: z.coerce.number().min(1, 'Minimum 1').max(5, 'Maximum 5'),
  avatarUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Avatar URL must be valid http/https'),
  sortOrder: z.coerce.number().min(0, 'Minimum 0').max(9999, 'Maximum 9999'),
  isActive: z.boolean(),
});

const defaultValues = {
  name: '',
  role: '',
  text: '',
  rating: 5,
  avatarUrl: '',
  sortOrder: 0,
  isActive: true,
};

function TestimonialsPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [testimonials, setTestimonials] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(testimonialSchema),
    defaultValues,
  });

  const avatarUrl = watch('avatarUrl');
  const isEditMode = Boolean(editingId);

  const fetchTestimonials = async () => {
    try {
      setIsTableLoading(true);
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load testimonials');
        return;
      }

      setTestimonials(Array.isArray(result.data) ? result.data : []);
    } catch {
      toastError('Unable to connect server. Please try again.');
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
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
        if (width < 300 || height < 300) {
          resolve({ ok: false, message: 'Image resolution must be at least 300x300' });
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
      toastError('Please choose avatar image first');
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
      formData.append('avatar', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/testimonials/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.avatarUrl) {
        toastError(result?.message || 'Failed to upload avatar');
        return;
      }

      setValue('avatarUrl', result.data.avatarUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('Avatar uploaded');
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const url = isEditMode ? `${API_BASE_URL}/api/testimonials/${editingId}` : `${API_BASE_URL}/api/testimonials`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save testimonial');
        return;
      }

      toastSuccess(isEditMode ? 'Testimonial updated successfully' : 'Testimonial created successfully');
      resetForm();
      fetchTestimonials();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const onEdit = (item) => {
    setEditingId(item._id);
    setSelectedImage(null);
    reset({
      name: item.name || '',
      role: item.role || '',
      text: item.text || '',
      rating: Number(item.rating || 5),
      avatarUrl: item.avatarUrl || '',
      sortOrder: Number(item.sortOrder || 0),
      isActive: Boolean(item.isActive),
    });
  };

  const onDelete = async (item) => {
    const confirmed = await confirmAction({
      title: 'Delete testimonial?',
      text: `"${item.name}" testimonial will be removed permanently.`,
      confirmText: 'Yes, delete',
    });
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/testimonials/${item._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to delete testimonial');
        return;
      }

      if (editingId === item._id) {
        resetForm();
      }
      toastSuccess('Testimonial deleted successfully');
      fetchTestimonials();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const rows = useMemo(
    () =>
      testimonials.map((item, index) => ({
        id: item._id,
        srNo: index + 1,
        name: item.name,
        role: item.role,
        rating: item.rating,
        status: item.isActive ? 'Active' : 'Inactive',
        order: item.sortOrder ?? 0,
        avatar: item.avatarUrl || '',
        actions: item,
      })),
    [testimonials],
  );

  const columns = [
    { key: 'srNo', label: '#', sortable: true },
    {
      key: 'avatar',
      label: 'Avatar',
      render: (value, row) =>
        value ? (
          <img src={value} alt={row.name} className="rounded-circle border" style={{ width: '42px', height: '42px', objectFit: 'cover' }} />
        ) : (
          <span
            className="rounded-circle border d-inline-flex align-items-center justify-content-center fw-semibold"
            style={{ width: '42px', height: '42px', backgroundColor: '#eef2ff', color: '#1f2a44' }}
          >
            {row.name.charAt(0)}
          </span>
        ),
    },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
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
          <h2>{isEditMode ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="form-label">Name</label>
            <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name')} />
            {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
          </div>

          <div>
            <label className="form-label">Role</label>
            <input className={`form-control ${errors.role ? 'is-invalid' : ''}`} {...register('role')} />
            {errors.role && <div className="invalid-feedback d-block">{errors.role.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Message</label>
            <textarea className={`form-control ${errors.text ? 'is-invalid' : ''}`} rows={3} {...register('text')} />
            {errors.text && <div className="invalid-feedback d-block">{errors.text.message}</div>}
          </div>

          <div>
            <label className="form-label">Rating (1-5)</label>
            <input type="number" className={`form-control ${errors.rating ? 'is-invalid' : ''}`} {...register('rating')} />
            {errors.rating && <div className="invalid-feedback d-block">{errors.rating.message}</div>}
          </div>

          <div>
            <label className="form-label">Sort Order</label>
            <input type="number" className={`form-control ${errors.sortOrder ? 'is-invalid' : ''}`} {...register('sortOrder')} />
            {errors.sortOrder && <div className="invalid-feedback d-block">{errors.sortOrder.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Avatar URL (optional)</label>
            <input className={`form-control ${errors.avatarUrl ? 'is-invalid' : ''}`} {...register('avatarUrl')} />
            {errors.avatarUrl && <div className="invalid-feedback d-block">{errors.avatarUrl.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Upload Avatar (min 300x300, max 10MB)</label>
            <div className="d-flex flex-column flex-md-row gap-2 align-items-start">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
              />
              <button type="button" className="btn btn-outline-primary" onClick={onUploadImage} disabled={isUploadingImage}>
                {isUploadingImage ? 'Uploading...' : 'Upload Avatar'}
              </button>
            </div>
            {selectedImage && <small className="text-muted d-block mt-1">Selected: {selectedImage.name}</small>}
            {avatarUrl && (
              <div className="mt-2">
                <img src={avatarUrl} alt="Avatar preview" className="rounded-circle border" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="admin-field-full">
            <div className="form-check">
              <input id="testimonialIsActive" type="checkbox" className="form-check-input" {...register('isActive')} />
              <label htmlFor="testimonialIsActive" className="form-check-label">
                Active (show on frontend)
              </label>
            </div>
          </div>

          <div className="admin-form-actions d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Testimonial' : 'Add Testimonial'}
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
        title={isTableLoading ? 'Testimonials Table (Loading...)' : 'Testimonials Table'}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search by name/role..."
      />
    </>
  );
}

export default TestimonialsPage;
