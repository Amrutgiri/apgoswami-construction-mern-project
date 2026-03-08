import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const pointSchema = z.object({
  title: z.string().trim().min(2, 'Title required').max(80, 'Max 80 characters'),
  description: z.string().trim().min(5, 'Description required').max(300, 'Max 300 characters'),
  iconKey: z.enum(['icon-1', 'icon-2', 'icon-3']),
  sortOrder: z.coerce.number().min(0, 'Minimum 0').max(9999, 'Maximum 9999'),
});

const schema = z.object({
  sectionTag: z.string().trim().min(2, 'Section tag required').max(60, 'Max 60 characters'),
  heading: z.string().trim().min(5, 'Heading required').max(150, 'Max 150 characters'),
  description: z.string().trim().min(10, 'Description required').max(500, 'Max 500 characters'),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Image URL must be valid http/https'),
  badgeTitle: z.string().trim().min(2, 'Badge title required').max(60, 'Max 60 characters'),
  badgeText: z.string().trim().min(2, 'Badge text required').max(120, 'Max 120 characters'),
  points: z.array(pointSchema).min(1, 'At least one point is required'),
});

const defaultValues = {
  sectionTag: '',
  heading: '',
  description: '',
  imageUrl: '',
  badgeTitle: '',
  badgeText: '',
  points: [{ title: '', description: '', iconKey: 'icon-1', sortOrder: 0 }],
};

function WhyChooseUsPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'points',
  });

  const imageUrl = watch('imageUrl');

  const fetchData = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/why-choose-us`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load content');
        return;
      }

      reset({
        sectionTag: result.data.sectionTag || '',
        heading: result.data.heading || '',
        description: result.data.description || '',
        imageUrl: result.data.imageUrl || '',
        badgeTitle: result.data.badgeTitle || '',
        badgeText: result.data.badgeText || '',
        points: Array.isArray(result.data.points) && result.data.points.length
          ? result.data.points
          : defaultValues.points,
      });
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        URL.revokeObjectURL(objectUrl);
        if (image.width < 900 || image.height < 600) {
          resolve({ ok: false, message: 'Image resolution must be at least 900x600' });
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

  const uploadImage = async () => {
    if (!selectedImage) {
      toastError('Please choose image first');
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
      formData.append('whyChooseImage', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/why-choose-us/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.imageUrl) {
        toastError(result?.message || 'Failed to upload image');
        return;
      }

      setValue('imageUrl', result.data.imageUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('Image uploaded');
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/why-choose-us`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save content');
        return;
      }

      toastSuccess('Why Choose Us content saved successfully');
      fetchData();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Why Choose Us Content</h2>
      </div>

      <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="form-label">Section Tag</label>
          <input className={`form-control ${errors.sectionTag ? 'is-invalid' : ''}`} {...register('sectionTag')} />
          {errors.sectionTag && <div className="invalid-feedback d-block">{errors.sectionTag.message}</div>}
        </div>

        <div>
          <label className="form-label">Heading</label>
          <input className={`form-control ${errors.heading ? 'is-invalid' : ''}`} {...register('heading')} />
          {errors.heading && <div className="invalid-feedback d-block">{errors.heading.message}</div>}
        </div>

        <div className="admin-field-full">
          <label className="form-label">Description</label>
          <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows={3} {...register('description')} />
          {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
        </div>

        <div>
          <label className="form-label">Badge Title</label>
          <input className={`form-control ${errors.badgeTitle ? 'is-invalid' : ''}`} {...register('badgeTitle')} />
          {errors.badgeTitle && <div className="invalid-feedback d-block">{errors.badgeTitle.message}</div>}
        </div>

        <div>
          <label className="form-label">Badge Text</label>
          <input className={`form-control ${errors.badgeText ? 'is-invalid' : ''}`} {...register('badgeText')} />
          {errors.badgeText && <div className="invalid-feedback d-block">{errors.badgeText.message}</div>}
        </div>

        <div className="admin-field-full">
          <label className="form-label">Image URL</label>
          <input className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} {...register('imageUrl')} />
          {errors.imageUrl && <div className="invalid-feedback d-block">{errors.imageUrl.message}</div>}
        </div>

        <div className="admin-field-full">
          <label className="form-label">Upload Image (min 900x600, max 10MB)</label>
          <div className="d-flex flex-column flex-md-row gap-2 align-items-start">
            <input type="file" accept="image/*" className="form-control" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} />
            <button type="button" className="btn btn-outline-primary" onClick={uploadImage} disabled={isUploadingImage}>
              {isUploadingImage ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="Why choose preview" className="img-fluid rounded border" style={{ maxHeight: '180px', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div className="admin-field-full">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0">Feature Points</label>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() =>
                append({
                  title: '',
                  description: '',
                  iconKey: 'icon-1',
                  sortOrder: fields.length,
                })
              }
            >
              Add Point
            </button>
          </div>

          <div className="d-grid gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3">
                <div className="row g-2">
                  <div className="col-md-3">
                    <label className="form-label">Icon</label>
                    <select className="form-select" {...register(`points.${index}.iconKey`)}>
                      <option value="icon-1">Icon 1</option>
                      <option value="icon-2">Icon 2</option>
                      <option value="icon-3">Icon 3</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-control" {...register(`points.${index}.sortOrder`)} />
                  </div>
                  <div className="col-md-6 d-flex align-items-end justify-content-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input className="form-control" {...register(`points.${index}.title`)} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={2} {...register(`points.${index}.description`)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.points && <div className="invalid-feedback d-block">{errors.points.message || 'Please fix points fields'}</div>}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Why Choose Us'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default WhyChooseUsPage;
