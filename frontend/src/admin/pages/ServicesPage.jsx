import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminDataTable from '../components/AdminDataTable';
import { confirmAction, toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const serviceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title is required')
    .max(120, 'Max 120 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  description: z
    .string()
    .trim()
    .min(10, 'Description is required')
    .max(300, 'Max 300 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image is required')
    .refine((value) => /^https?:\/\/.+/i.test(value), 'Image URL must be valid http/https'),
  sortOrder: z.coerce.number().min(0, 'Minimum 0').max(9999, 'Maximum 9999'),
  isActive: z.boolean(),
});

const defaultValues = {
  title: '',
  description: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
};

function ServicesPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [services, setServices] = useState([]);
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
    resolver: zodResolver(serviceSchema),
    defaultValues,
  });

  const imageUrl = watch('imageUrl');
  const isEditMode = Boolean(editingId);

  const fetchServices = async () => {
    try {
      setIsTableLoading(true);
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load services');
        return;
      }

      setServices(Array.isArray(result.data) ? result.data : []);
    } catch {
      toastError('Unable to connect server. Please try again.');
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
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
        if (width < 800 || height < 600) {
          resolve({ ok: false, message: 'Image resolution must be at least 800x600' });
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
      toastError('Please choose service image first');
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
      formData.append('serviceImage', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/services/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.imageUrl) {
        toastError(result?.message || 'Failed to upload service image');
        return;
      }

      setValue('imageUrl', result.data.imageUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('Service image uploaded');
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const url = isEditMode ? `${API_BASE_URL}/api/services/${editingId}` : `${API_BASE_URL}/api/services`;
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
        toastError(result?.message || 'Failed to save service');
        return;
      }

      toastSuccess(isEditMode ? 'Service updated successfully' : 'Service created successfully');
      resetForm();
      fetchServices();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const onEdit = (service) => {
    setEditingId(service._id);
    setSelectedImage(null);
    reset({
      title: service.title || '',
      description: service.description || '',
      imageUrl: service.imageUrl || '',
      sortOrder: Number(service.sortOrder || 0),
      isActive: Boolean(service.isActive),
    });
  };

  const onDelete = async (service) => {
    const confirmed = await confirmAction({
      title: 'Delete service?',
      text: `"${service.title}" will be removed permanently.`,
      confirmText: 'Yes, delete',
    });
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/services/${service._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to delete service');
        return;
      }

      if (editingId === service._id) {
        resetForm();
      }
      toastSuccess('Service deleted successfully');
      fetchServices();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const rows = useMemo(
    () =>
      services.map((service, index) => ({
        id: service._id,
        srNo: index + 1,
        title: service.title,
        status: service.isActive ? 'Active' : 'Inactive',
        sortOrder: service.sortOrder ?? 0,
        updatedAt: service.updatedAt ? new Date(service.updatedAt).toLocaleDateString() : '-',
        imageUrl: service.imageUrl,
        actions: service,
      })),
    [services],
  );

  const columns = [
    { key: 'srNo', label: '#', sortable: true },
    { key: 'title', label: 'Service Title', sortable: true },
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
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`admin-badge ${value === 'Active' ? 'seen' : 'unseen'}`}>{value}</span>
      ),
    },
    { key: 'sortOrder', label: 'Order', sortable: true },
    { key: 'updatedAt', label: 'Updated', sortable: true },
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
          <h2>{isEditMode ? 'Edit Service' : 'Add Service'}</h2>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="form-label">Title</label>
            <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} {...register('title')} />
            {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
          </div>

          <div>
            <label className="form-label">Sort Order</label>
            <input type="number" className={`form-control ${errors.sortOrder ? 'is-invalid' : ''}`} {...register('sortOrder')} />
            {errors.sortOrder && <div className="invalid-feedback d-block">{errors.sortOrder.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Description</label>
            <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows={3} {...register('description')} />
            {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Image URL</label>
            <input className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} {...register('imageUrl')} />
            {errors.imageUrl && <div className="invalid-feedback d-block">{errors.imageUrl.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Upload Image (min 800x600, max 10MB)</label>
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
                <img src={imageUrl} alt="Service preview" className="img-fluid rounded border" style={{ maxHeight: '180px', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="admin-field-full">
            <div className="form-check">
              <input id="serviceIsActive" type="checkbox" className="form-check-input" {...register('isActive')} />
              <label htmlFor="serviceIsActive" className="form-check-label">
                Active (show on frontend)
              </label>
            </div>
          </div>

          <div className="admin-form-actions d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Service' : 'Add Service'}
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
        title={isTableLoading ? 'Services Table (Loading...)' : 'Services Table'}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search by service title..."
      />
    </>
  );
}

export default ServicesPage;
