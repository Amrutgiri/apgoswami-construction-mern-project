import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const textField = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(300, 'Value is too long')
  .refine((value) => !/<\s*\/?\s*script\b[^>]*>/i.test(value), 'Scripting tags are not allowed');

const aboutSectionSchema = z.object({
  sectionTag: textField.max(60),
  heading: textField.max(150),
  paragraph1: textField.max(500),
  paragraph2: textField.max(500),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Image URL must be valid http/https'),
  badgeTitle: textField.max(80),
  badgeText: textField.max(120),
  stat1Value: textField.max(20),
  stat1Label: textField.max(60),
  stat2Value: textField.max(20),
  stat2Label: textField.max(60),
  stat3Value: textField.max(20),
  stat3Label: textField.max(60),
  highlight1Title: textField.max(80),
  highlight1Text: textField.max(250),
  highlight2Title: textField.max(80),
  highlight2Text: textField.max(250),
  highlight3Title: textField.max(80),
  highlight3Text: textField.max(250),
});

function AboutSectionPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(aboutSectionSchema),
    defaultValues: {
      sectionTag: '',
      heading: '',
      paragraph1: '',
      paragraph2: '',
      imageUrl: '',
      badgeTitle: '',
      badgeText: '',
      stat1Value: '',
      stat1Label: '',
      stat2Value: '',
      stat2Label: '',
      stat3Value: '',
      stat3Label: '',
      highlight1Title: '',
      highlight1Text: '',
      highlight2Title: '',
      highlight2Text: '',
      highlight3Title: '',
      highlight3Text: '',
    },
  });

  const imageUrl = watch('imageUrl');

  const fetchData = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/about-section`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load about section');
        return;
      }

      reset(result.data);
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

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toastError('Please choose about image first');
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
      formData.append('aboutImage', selectedImage);

      const response = await fetch(`${API_BASE_URL}/api/about-section/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result?.success || !result?.data?.imageUrl) {
        toastError(result?.message || 'Failed to upload image');
        return;
      }

      const imageUrl = result.data.imageUrl;
      const saveResponse = await fetch(`${API_BASE_URL}/api/about-section/image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl }),
      });
      const saveResult = await saveResponse.json();

      if (!saveResponse.ok || !saveResult?.success) {
        toastError(saveResult?.message || 'Image uploaded but failed to save');
        return;
      }

      setValue('imageUrl', imageUrl, { shouldValidate: true });
      setSelectedImage(null);
      toastSuccess('About image uploaded and saved');
      fetchData();
    } catch {
      toastError('Unable to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/about-section`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save about section');
        return;
      }

      toastSuccess('About section saved successfully');
      fetchData();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>About Section Content</h2>
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
          <label className="form-label">Paragraph 1</label>
          <textarea className={`form-control ${errors.paragraph1 ? 'is-invalid' : ''}`} rows={3} {...register('paragraph1')} />
          {errors.paragraph1 && <div className="invalid-feedback d-block">{errors.paragraph1.message}</div>}
        </div>

        <div className="admin-field-full">
          <label className="form-label">Paragraph 2</label>
          <textarea className={`form-control ${errors.paragraph2 ? 'is-invalid' : ''}`} rows={3} {...register('paragraph2')} />
          {errors.paragraph2 && <div className="invalid-feedback d-block">{errors.paragraph2.message}</div>}
        </div>

        <div className="admin-field-full">
          <label className="form-label">About Image URL</label>
          <input className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} {...register('imageUrl')} />
          {errors.imageUrl && <div className="invalid-feedback d-block">{errors.imageUrl.message}</div>}
        </div>

        <div className="admin-field-full">
          <label className="form-label">Upload About Image (min 1000x700, max 10MB)</label>
          <div className="d-flex flex-column flex-md-row gap-2 align-items-start">
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            />
            <button type="button" className="btn btn-outline-primary" onClick={handleUploadImage} disabled={isUploadingImage}>
              {isUploadingImage ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
          {selectedImage && <small className="text-muted d-block mt-1">Selected: {selectedImage.name}</small>}
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="About preview" className="img-fluid rounded border" style={{ maxHeight: '180px', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div>
          <label className="form-label">Badge Title</label>
          <input className={`form-control ${errors.badgeTitle ? 'is-invalid' : ''}`} {...register('badgeTitle')} />
        </div>
        <div>
          <label className="form-label">Badge Text</label>
          <input className={`form-control ${errors.badgeText ? 'is-invalid' : ''}`} {...register('badgeText')} />
        </div>

        <div>
          <label className="form-label">Stat 1 Value</label>
          <input className={`form-control ${errors.stat1Value ? 'is-invalid' : ''}`} {...register('stat1Value')} />
        </div>
        <div>
          <label className="form-label">Stat 1 Label</label>
          <input className={`form-control ${errors.stat1Label ? 'is-invalid' : ''}`} {...register('stat1Label')} />
        </div>
        <div>
          <label className="form-label">Stat 2 Value</label>
          <input className={`form-control ${errors.stat2Value ? 'is-invalid' : ''}`} {...register('stat2Value')} />
        </div>
        <div>
          <label className="form-label">Stat 2 Label</label>
          <input className={`form-control ${errors.stat2Label ? 'is-invalid' : ''}`} {...register('stat2Label')} />
        </div>
        <div>
          <label className="form-label">Stat 3 Value</label>
          <input className={`form-control ${errors.stat3Value ? 'is-invalid' : ''}`} {...register('stat3Value')} />
        </div>
        <div>
          <label className="form-label">Stat 3 Label</label>
          <input className={`form-control ${errors.stat3Label ? 'is-invalid' : ''}`} {...register('stat3Label')} />
        </div>

        <div>
          <label className="form-label">Highlight 1 Title</label>
          <input className={`form-control ${errors.highlight1Title ? 'is-invalid' : ''}`} {...register('highlight1Title')} />
        </div>
        <div>
          <label className="form-label">Highlight 1 Text</label>
          <textarea className={`form-control ${errors.highlight1Text ? 'is-invalid' : ''}`} rows={2} {...register('highlight1Text')} />
        </div>
        <div>
          <label className="form-label">Highlight 2 Title</label>
          <input className={`form-control ${errors.highlight2Title ? 'is-invalid' : ''}`} {...register('highlight2Title')} />
        </div>
        <div>
          <label className="form-label">Highlight 2 Text</label>
          <textarea className={`form-control ${errors.highlight2Text ? 'is-invalid' : ''}`} rows={2} {...register('highlight2Text')} />
        </div>
        <div>
          <label className="form-label">Highlight 3 Title</label>
          <input className={`form-control ${errors.highlight3Title ? 'is-invalid' : ''}`} {...register('highlight3Title')} />
        </div>
        <div>
          <label className="form-label">Highlight 3 Text</label>
          <textarea className={`form-control ${errors.highlight3Text ? 'is-invalid' : ''}`} rows={2} {...register('highlight3Text')} />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save About Section'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AboutSectionPage;
