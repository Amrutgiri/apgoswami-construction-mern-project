import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const heroSchema = z.object({
  preHeading: z.string().trim().min(2, 'Pre heading is required').max(120, 'Max 120 characters'),
  heading: z.string().trim().min(5, 'Heading is required').max(180, 'Max 180 characters'),
  subHeading: z.string().trim().min(5, 'Sub heading is required').max(200, 'Max 200 characters'),
  heroImage: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Hero image must be a valid http/https URL'),
  primaryButtonText: z.string().trim().min(2, 'Primary button text is required').max(40, 'Max 40 characters'),
  primaryButtonLink: z.string().trim().regex(/^\/[A-Za-z0-9/_-]*$/, 'Use internal route path (example: /contact-us)'),
  secondaryButtonText: z.string().trim().min(2, 'Secondary button text is required').max(40, 'Max 40 characters'),
  secondaryButtonLink: z.string().trim().regex(/^\/[A-Za-z0-9/_-]*$/, 'Use internal route path (example: /projects)'),
}).refine(
  (data) =>
    !/<\s*\/?\s*script\b[^>]*>/i.test(data.preHeading) &&
    !/<\s*\/?\s*script\b[^>]*>/i.test(data.heading) &&
    !/<\s*\/?\s*script\b[^>]*>/i.test(data.subHeading) &&
    !/<\s*\/?\s*script\b[^>]*>/i.test(data.primaryButtonText) &&
    !/<\s*\/?\s*script\b[^>]*>/i.test(data.secondaryButtonText),
  { message: 'Scripting tags are not allowed', path: ['preHeading'] },
);

function HomeHeroPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      preHeading: '',
      heading: '',
      subHeading: '',
      heroImage: '',
      primaryButtonText: '',
      primaryButtonLink: '',
      secondaryButtonText: '',
      secondaryButtonLink: '',
    },
  });

  const heroImageValue = watch('heroImage');

  const fetchHeroData = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/home/hero`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load hero content');
        return;
      }

      reset({
        preHeading: result.data.preHeading || '',
        heading: result.data.heading || '',
        subHeading: result.data.subHeading || '',
        heroImage: result.data.heroImage || '',
        primaryButtonText: result.data.primaryButtonText || '',
        primaryButtonLink: result.data.primaryButtonLink || '',
        secondaryButtonText: result.data.secondaryButtonText || '',
        secondaryButtonLink: result.data.secondaryButtonLink || '',
      });
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/home/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save hero content');
        return;
      }

      toastSuccess('Home hero content saved successfully');
      fetchHeroData();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  const validateHeroImageFile = (file) =>
    new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
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

        if (width < 1280 || height < 720) {
          resolve({ ok: false, message: 'Image resolution must be at least 1280x720' });
          return;
        }

        const expectedRatio = 16 / 9;
        const actualRatio = width / height;
        if (Math.abs(actualRatio - expectedRatio) > 0.03) {
          resolve({ ok: false, message: 'Image must be in 16:9 aspect ratio' });
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

  const handleUploadHeroImage = async () => {
    if (!selectedImage) {
      toastError('Please choose hero image first');
      return;
    }

    const fileCheck = await validateHeroImageFile(selectedImage);
    if (!fileCheck.ok) {
      toastError(fileCheck.message);
      return;
    }

    try {
      setIsUploadingImage(true);
      const token = getAdminToken();
      const formData = new FormData();
      formData.append('heroImage', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/home/hero/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.imageUrl) {
        toastError(result?.message || 'Failed to upload hero image');
        return;
      }

      const imageUrl = result.data.imageUrl;

      const saveResponse = await fetch(`${API_BASE_URL}/api/home/hero/image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ heroImage: imageUrl }),
      });
      const saveResult = await saveResponse.json();

      if (!saveResponse.ok || !saveResult?.success) {
        toastError(saveResult?.message || 'Image uploaded but failed to save');
        return;
      }

      setValue('heroImage', imageUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('Hero image uploaded and saved');
      fetchHeroData();
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Home Hero Content</h2>
      </div>

      {isLoading ? (
        <p className="mb-0">Loading hero content...</p>
      ) : (
        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="admin-field-full">
            <label className="form-label">Pre Heading</label>
            <input className={`form-control ${errors.preHeading ? 'is-invalid' : ''}`} {...register('preHeading')} />
            {errors.preHeading && <div className="invalid-feedback d-block">{errors.preHeading.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Heading</label>
            <textarea className={`form-control ${errors.heading ? 'is-invalid' : ''}`} rows={2} {...register('heading')} />
            <small className="text-muted">Use Enter for new line. Frontend will keep same design.</small>
            {errors.heading && <div className="invalid-feedback d-block">{errors.heading.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Sub Heading</label>
            <textarea className={`form-control ${errors.subHeading ? 'is-invalid' : ''}`} rows={2} {...register('subHeading')} />
            {errors.subHeading && <div className="invalid-feedback d-block">{errors.subHeading.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Hero Background Image URL (optional)</label>
            <input className={`form-control ${errors.heroImage ? 'is-invalid' : ''}`} placeholder="https://example.com/hero-image.jpg" {...register('heroImage')} />
            <small className="text-muted">Leave blank to use existing default hero background.</small>
            {errors.heroImage && <div className="invalid-feedback d-block">{errors.heroImage.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Upload Hero Image (16:9, min 1280x720, max 10MB)</label>
            <div className="d-flex flex-column flex-md-row gap-2 align-items-start">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
              />
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleUploadHeroImage}
                disabled={isUploadingImage}
              >
                {isUploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
            {selectedImage && <small className="text-muted d-block mt-1">Selected: {selectedImage.name}</small>}
            {heroImageValue && (
              <div className="mt-2">
                <img
                  src={heroImageValue}
                  alt="Hero preview"
                  className="img-fluid rounded border"
                  style={{ maxHeight: '180px', objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Primary Button Text</label>
            <input className={`form-control ${errors.primaryButtonText ? 'is-invalid' : ''}`} {...register('primaryButtonText')} />
            {errors.primaryButtonText && <div className="invalid-feedback d-block">{errors.primaryButtonText.message}</div>}
          </div>

          <div>
            <label className="form-label">Primary Button Link</label>
            <input className={`form-control ${errors.primaryButtonLink ? 'is-invalid' : ''}`} {...register('primaryButtonLink')} />
            {errors.primaryButtonLink && <div className="invalid-feedback d-block">{errors.primaryButtonLink.message}</div>}
          </div>

          <div>
            <label className="form-label">Secondary Button Text</label>
            <input className={`form-control ${errors.secondaryButtonText ? 'is-invalid' : ''}`} {...register('secondaryButtonText')} />
            {errors.secondaryButtonText && <div className="invalid-feedback d-block">{errors.secondaryButtonText.message}</div>}
          </div>

          <div>
            <label className="form-label">Secondary Button Link</label>
            <input className={`form-control ${errors.secondaryButtonLink ? 'is-invalid' : ''}`} {...register('secondaryButtonLink')} />
            {errors.secondaryButtonLink && <div className="invalid-feedback d-block">{errors.secondaryButtonLink.message}</div>}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Hero Content'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default HomeHeroPage;
