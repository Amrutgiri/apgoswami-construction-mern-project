import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastError, toastSuccess } from '../utils/alerts';
import { getAdminToken } from '../utils/auth';

const schema = z.object({
  heroPreHeading: z.string().trim().min(2, 'Required').max(60, 'Max 60 characters'),
  heroHeading: z.string().trim().min(2, 'Required').max(120, 'Max 120 characters'),
  heroText: z.string().trim().min(10, 'Required').max(250, 'Max 250 characters'),
  formSectionTag: z.string().trim().min(2, 'Required').max(60, 'Max 60 characters'),
  formHeading: z.string().trim().min(2, 'Required').max(160, 'Max 160 characters'),
  formDescription: z.string().trim().min(10, 'Required').max(300, 'Max 300 characters'),
  callCardSubtitle: z.string().trim().min(2, 'Required').max(120, 'Max 120 characters'),
  emailCardSubtitle: z.string().trim().min(2, 'Required').max(120, 'Max 120 characters'),
  addressCardSubtitle: z.string().trim().min(2, 'Required').max(120, 'Max 120 characters'),
  mapTitle: z.string().trim().min(2, 'Required').max(80, 'Max 80 characters'),
  mapSubtitle: z.string().trim().min(2, 'Required').max(160, 'Max 160 characters'),
  quickQuestions: z.array(z.object({ value: z.string().trim().min(2, 'Required').max(160, 'Max 160 characters') })).min(1, 'At least 1 question'),
  serviceOptions: z.array(z.object({ value: z.string().trim().min(2, 'Required').max(80, 'Max 80 characters') })).min(1, 'At least 1 service'),
});

const defaultValues = {
  heroPreHeading: '',
  heroHeading: '',
  heroText: '',
  formSectionTag: '',
  formHeading: '',
  formDescription: '',
  callCardSubtitle: '',
  emailCardSubtitle: '',
  addressCardSubtitle: '',
  mapTitle: '',
  mapSubtitle: '',
  quickQuestions: [{ value: '' }],
  serviceOptions: [{ value: '' }],
};

function ContactContentPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isLoading },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const questionsFieldArray = useFieldArray({ control, name: 'quickQuestions' });
  const servicesFieldArray = useFieldArray({ control, name: 'serviceOptions' });

  const fetchData = async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/contact-page-content`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to load contact content');
        return;
      }

      reset({
        heroPreHeading: result.data.heroPreHeading || '',
        heroHeading: result.data.heroHeading || '',
        heroText: result.data.heroText || '',
        formSectionTag: result.data.formSectionTag || '',
        formHeading: result.data.formHeading || '',
        formDescription: result.data.formDescription || '',
        callCardSubtitle: result.data.callCardSubtitle || '',
        emailCardSubtitle: result.data.emailCardSubtitle || '',
        addressCardSubtitle: result.data.addressCardSubtitle || '',
        mapTitle: result.data.mapTitle || '',
        mapSubtitle: result.data.mapSubtitle || '',
        quickQuestions: Array.isArray(result.data.quickQuestions) && result.data.quickQuestions.length
          ? result.data.quickQuestions.map((value) => ({ value }))
          : [{ value: '' }],
        serviceOptions: Array.isArray(result.data.serviceOptions) && result.data.serviceOptions.length
          ? result.data.serviceOptions.map((value) => ({ value }))
          : [{ value: '' }],
      });
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/api/contact-page-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          quickQuestions: values.quickQuestions.map((item) => item.value.trim()).filter(Boolean),
          serviceOptions: values.serviceOptions.map((item) => item.value.trim()).filter(Boolean),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to save contact content');
        return;
      }
      toastSuccess('Contact content saved successfully');
      fetchData();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Contact Page Content</h2>
      </div>

      {isLoading ? (
        <p className="mb-0">Loading contact content...</p>
      ) : (
        <form className="admin-form-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="form-label">Hero Pre Heading</label>
            <input className={`form-control ${errors.heroPreHeading ? 'is-invalid' : ''}`} {...register('heroPreHeading')} />
          </div>
          <div>
            <label className="form-label">Hero Heading</label>
            <input className={`form-control ${errors.heroHeading ? 'is-invalid' : ''}`} {...register('heroHeading')} />
          </div>
          <div className="admin-field-full">
            <label className="form-label">Hero Text</label>
            <textarea className={`form-control ${errors.heroText ? 'is-invalid' : ''}`} rows={2} {...register('heroText')} />
          </div>

          <div>
            <label className="form-label">Form Section Tag</label>
            <input className={`form-control ${errors.formSectionTag ? 'is-invalid' : ''}`} {...register('formSectionTag')} />
          </div>
          <div>
            <label className="form-label">Form Heading</label>
            <input className={`form-control ${errors.formHeading ? 'is-invalid' : ''}`} {...register('formHeading')} />
          </div>
          <div className="admin-field-full">
            <label className="form-label">Form Description</label>
            <textarea className={`form-control ${errors.formDescription ? 'is-invalid' : ''}`} rows={2} {...register('formDescription')} />
          </div>

          <div>
            <label className="form-label">Call Card Subtitle</label>
            <input className={`form-control ${errors.callCardSubtitle ? 'is-invalid' : ''}`} {...register('callCardSubtitle')} />
          </div>
          <div>
            <label className="form-label">Email Card Subtitle</label>
            <input className={`form-control ${errors.emailCardSubtitle ? 'is-invalid' : ''}`} {...register('emailCardSubtitle')} />
          </div>
          <div className="admin-field-full">
            <label className="form-label">Address Card Subtitle</label>
            <input className={`form-control ${errors.addressCardSubtitle ? 'is-invalid' : ''}`} {...register('addressCardSubtitle')} />
          </div>

          <div>
            <label className="form-label">Map Title</label>
            <input className={`form-control ${errors.mapTitle ? 'is-invalid' : ''}`} {...register('mapTitle')} />
          </div>
          <div>
            <label className="form-label">Map Subtitle</label>
            <input className={`form-control ${errors.mapSubtitle ? 'is-invalid' : ''}`} {...register('mapSubtitle')} />
          </div>

          <div className="admin-field-full">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Quick Questions</label>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => questionsFieldArray.append({ value: '' })}>
                Add Question
              </button>
            </div>
            <div className="d-grid gap-2">
              {questionsFieldArray.fields.map((field, index) => (
                <div key={field.id} className="d-flex gap-2">
                  <input className="form-control" {...register(`quickQuestions.${index}.value`)} />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => questionsFieldArray.remove(index)}
                    disabled={questionsFieldArray.fields.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-field-full">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Service Options</label>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => servicesFieldArray.append({ value: '' })}>
                Add Service
              </button>
            </div>
            <div className="d-grid gap-2">
              {servicesFieldArray.fields.map((field, index) => (
                <div key={field.id} className="d-flex gap-2">
                  <input className="form-control" {...register(`serviceOptions.${index}.value`)} />
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => servicesFieldArray.remove(index)}
                    disabled={servicesFieldArray.fields.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Contact Content'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default ContactContentPage;
