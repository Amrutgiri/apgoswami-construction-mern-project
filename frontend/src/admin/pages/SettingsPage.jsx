import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const settingsSchema = z.object({
  websiteName: z.string().trim().min(2, 'Website name is required').max(80, 'Max 80 characters'),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  callNumber: z.string().trim().regex(/^\d{10}$/, 'Call number must be exactly 10 digits'),
  whatsappNumber: z.string().trim().regex(/^\d{10}$/, 'WhatsApp number must be exactly 10 digits'),
  fullAddress: z.string().trim().min(8, 'Address is too short').max(250, 'Max 250 characters'),
  description: z.string().trim().min(10, 'Description is too short').max(150, 'Max 150 characters'),
  businessHours: z.string().trim().min(5, 'Business hours are required').max(300, 'Max 300 characters'),
  officeLocationName: z.string().trim().max(120, 'Max 120 characters').optional().or(z.literal('')),
  officeLat: z
    .union([z.number().min(-90, 'Min -90').max(90, 'Max 90'), z.nan(), z.null()])
    .optional()
    .transform((value) => (value === null || Number.isNaN(value) ? null : value)),
  officeLng: z
    .union([z.number().min(-180, 'Min -180').max(180, 'Max 180'), z.nan(), z.null()])
    .optional()
    .transform((value) => (value === null || Number.isNaN(value) ? null : value)),
  mapEmbedUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), 'Map URL must be a valid http/https URL'),
});

function SettingsPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      websiteName: '',
      email: '',
      callNumber: '',
      whatsappNumber: '',
      fullAddress: '',
      description: '',
      businessHours: '',
      officeLocationName: '',
      officeLat: null,
      officeLng: null,
      mapEmbedUrl: '',
    },
  });

  const fetchSettings = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load settings');
        return;
      }

      reset({
        websiteName: result.data.websiteName || '',
        email: result.data.email || '',
        callNumber: result.data.callNumber || '',
        whatsappNumber: result.data.whatsappNumber || '',
        fullAddress: result.data.fullAddress || '',
        description: result.data.description || '',
        businessHours: result.data.businessHours || '',
        officeLocationName: result.data.officeLocationName || '',
        officeLat: result.data.officeLat ?? null,
        officeLng: result.data.officeLng ?? null,
        mapEmbedUrl: result.data.mapEmbedUrl || '',
      });
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save settings');
        return;
      }

      toastSuccess('Settings saved successfully');
      fetchSettings();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Website Settings</h2>
      </div>

      {isLoading ? (
        <p className="mb-0">Loading settings...</p>
      ) : (
        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="form-label">Website Name</label>
            <input className={`form-control ${errors.websiteName ? 'is-invalid' : ''}`} {...register('websiteName')} />
            {errors.websiteName && <div className="invalid-feedback d-block">{errors.websiteName.message}</div>}
          </div>

          <div>
            <label className="form-label">Website Email</label>
            <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
            {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
          </div>

          <div>
            <label className="form-label">Call Number</label>
            <input className={`form-control ${errors.callNumber ? 'is-invalid' : ''}`} inputMode="numeric" maxLength={10} {...register('callNumber')} />
            {errors.callNumber && <div className="invalid-feedback d-block">{errors.callNumber.message}</div>}
          </div>

          <div>
            <label className="form-label">WhatsApp Number</label>
            <input className={`form-control ${errors.whatsappNumber ? 'is-invalid' : ''}`} inputMode="numeric" maxLength={10} {...register('whatsappNumber')} />
            {errors.whatsappNumber && <div className="invalid-feedback d-block">{errors.whatsappNumber.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Full Address</label>
            <textarea className={`form-control ${errors.fullAddress ? 'is-invalid' : ''}`} rows={2} {...register('fullAddress')} />
            {errors.fullAddress && <div className="invalid-feedback d-block">{errors.fullAddress.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Description (max 150 chars)</label>
            <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows={2} maxLength={150} {...register('description')} />
            {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
          </div>

          <div className="admin-field-full">
            <label className="form-label">Business Hours</label>
            <textarea className={`form-control ${errors.businessHours ? 'is-invalid' : ''}`} rows={3} {...register('businessHours')} />
            {errors.businessHours && <div className="invalid-feedback d-block">{errors.businessHours.message}</div>}
          </div>

          <div>
            <label className="form-label">Office Location Name</label>
            <input className={`form-control ${errors.officeLocationName ? 'is-invalid' : ''}`} {...register('officeLocationName')} />
            {errors.officeLocationName && <div className="invalid-feedback d-block">{errors.officeLocationName.message}</div>}
          </div>

          <div>
            <label className="form-label">Map Embed URL (optional)</label>
            <input className={`form-control ${errors.mapEmbedUrl ? 'is-invalid' : ''}`} {...register('mapEmbedUrl')} />
            {errors.mapEmbedUrl && <div className="invalid-feedback d-block">{errors.mapEmbedUrl.message}</div>}
          </div>

          <div>
            <label className="form-label">Office Latitude (optional)</label>
            <input type="number" step="any" className={`form-control ${errors.officeLat ? 'is-invalid' : ''}`} {...register('officeLat', { setValueAs: (value) => (value === '' ? null : Number(value)) })} />
            {errors.officeLat && <div className="invalid-feedback d-block">{errors.officeLat.message}</div>}
          </div>

          <div>
            <label className="form-label">Office Longitude (optional)</label>
            <input type="number" step="any" className={`form-control ${errors.officeLng ? 'is-invalid' : ''}`} {...register('officeLng', { setValueAs: (value) => (value === '' ? null : Number(value)) })} />
            {errors.officeLng && <div className="invalid-feedback d-block">{errors.officeLng.message}</div>}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default SettingsPage;
