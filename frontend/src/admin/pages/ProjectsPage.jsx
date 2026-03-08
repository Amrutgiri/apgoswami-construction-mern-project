import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminDataTable from '../components/AdminDataTable';
import { confirmAction, toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title is required')
    .max(120, 'Max 120 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  type: z
    .string()
    .trim()
    .min(2, 'Type is required')
    .max(80, 'Max 80 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  location: z
    .string()
    .trim()
    .min(2, 'Location is required')
    .max(80, 'Max 80 characters')
    .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed'),
  year: z.string().trim().regex(/^\d{4}$/, 'Year must be 4 digits'),
  status: z.enum(['Planning', 'Ongoing', 'Completed', 'Upcoming']),
  imageUrl: z
    .string()
    .trim()
    .min(1, 'Image is required')
    .refine((value) => /^https?:\/\/.+/i.test(value), 'Image URL must be valid http/https'),
  sortOrder: z.coerce.number().min(0, 'Minimum 0').max(9999, 'Maximum 9999'),
  featured: z.boolean(),
  isActive: z.boolean(),
});

const defaultValues = {
  title: '',
  type: '',
  location: '',
  year: String(new Date().getFullYear()),
  status: 'Planning',
  imageUrl: '',
  sortOrder: 0,
  featured: false,
  isActive: true,
};

const statusClassMap = {
  Planning: 'planning',
  Ongoing: 'ongoing',
  Completed: 'completed',
  Upcoming: 'planning',
};

function ProjectsPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [projects, setProjects] = useState([]);
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
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const imageUrl = watch('imageUrl');
  const isEditMode = Boolean(editingId);

  const fetchProjects = async () => {
    try {
      setIsTableLoading(true);
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load projects');
        return;
      }

      setProjects(Array.isArray(result.data) ? result.data : []);
    } catch {
      toastError('Unable to connect server. Please try again.');
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
      toastError('Please choose project image first');
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
      formData.append('projectImage', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/projects/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.imageUrl) {
        toastError(result?.message || 'Failed to upload project image');
        return;
      }

      setValue('imageUrl', result.data.imageUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('Project image uploaded');
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const url = isEditMode ? `${API_BASE_URL}/api/projects/${editingId}` : `${API_BASE_URL}/api/projects`;
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
        toastError(result?.message || 'Failed to save project');
        return;
      }

      toastSuccess(isEditMode ? 'Project updated successfully' : 'Project created successfully');
      resetForm();
      fetchProjects();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const onEdit = (project) => {
    setEditingId(project._id);
    setSelectedImage(null);
    reset({
      title: project.title || '',
      type: project.type || '',
      location: project.location || '',
      year: project.year || String(new Date().getFullYear()),
      status: project.status || 'Planning',
      imageUrl: project.imageUrl || '',
      sortOrder: Number(project.sortOrder || 0),
      featured: Boolean(project.featured),
      isActive: Boolean(project.isActive),
    });
  };

  const onDelete = async (project) => {
    const confirmed = await confirmAction({
      title: 'Delete project?',
      text: `"${project.title}" will be removed permanently.`,
      confirmText: 'Yes, delete',
    });
    if (!confirmed) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/projects/${project._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to delete project');
        return;
      }

      if (editingId === project._id) {
        resetForm();
      }

      toastSuccess('Project deleted successfully');
      fetchProjects();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const rows = useMemo(
    () =>
      projects.map((project, index) => ({
        id: project._id,
        srNo: index + 1,
        title: project.title,
        type: project.type,
        status: project.status,
        year: project.year,
        sortOrder: project.sortOrder ?? 0,
        active: project.isActive ? 'Active' : 'Inactive',
        featured: project.featured ? 'Yes' : 'No',
        imageUrl: project.imageUrl,
        actions: project,
      })),
    [projects],
  );

  const columns = [
    { key: 'srNo', label: '#', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
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
      render: (value) => <span className={`admin-badge ${statusClassMap[value] || 'planning'}`}>{value}</span>,
    },
    { key: 'year', label: 'Year', sortable: true },
    { key: 'featured', label: 'Featured', sortable: true },
    { key: 'active', label: 'Active', sortable: true },
    { key: 'sortOrder', label: 'Order', sortable: true },
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
          <h2>{isEditMode ? 'Edit Project' : 'Add Project'}</h2>
        </div>

        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="form-label">Title</label>
            <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} {...register('title')} />
            {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
          </div>

          <div>
            <label className="form-label">Type</label>
            <input className={`form-control ${errors.type ? 'is-invalid' : ''}`} {...register('type')} />
            {errors.type && <div className="invalid-feedback d-block">{errors.type.message}</div>}
          </div>

          <div>
            <label className="form-label">Location</label>
            <input className={`form-control ${errors.location ? 'is-invalid' : ''}`} {...register('location')} />
            {errors.location && <div className="invalid-feedback d-block">{errors.location.message}</div>}
          </div>

          <div>
            <label className="form-label">Year</label>
            <input className={`form-control ${errors.year ? 'is-invalid' : ''}`} {...register('year')} />
            {errors.year && <div className="invalid-feedback d-block">{errors.year.message}</div>}
          </div>

          <div>
            <label className="form-label">Status</label>
            <select className={`form-select ${errors.status ? 'is-invalid' : ''}`} {...register('status')}>
              <option value="Planning">Planning</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            {errors.status && <div className="invalid-feedback d-block">{errors.status.message}</div>}
          </div>

          <div>
            <label className="form-label">Sort Order</label>
            <input type="number" className={`form-control ${errors.sortOrder ? 'is-invalid' : ''}`} {...register('sortOrder')} />
            {errors.sortOrder && <div className="invalid-feedback d-block">{errors.sortOrder.message}</div>}
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
                <img src={imageUrl} alt="Project preview" className="img-fluid rounded border" style={{ maxHeight: '180px', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="admin-field-full d-flex gap-4">
            <div className="form-check">
              <input id="projectFeatured" type="checkbox" className="form-check-input" {...register('featured')} />
              <label htmlFor="projectFeatured" className="form-check-label">
                Featured layout
              </label>
            </div>
            <div className="form-check">
              <input id="projectIsActive" type="checkbox" className="form-check-input" {...register('isActive')} />
              <label htmlFor="projectIsActive" className="form-check-label">
                Active (show on frontend)
              </label>
            </div>
          </div>

          <div className="admin-form-actions d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Project' : 'Add Project'}
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
        title={isTableLoading ? 'Projects Table (Loading...)' : 'Projects Table'}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search by project title/type..."
      />
    </>
  );
}

export default ProjectsPage;
