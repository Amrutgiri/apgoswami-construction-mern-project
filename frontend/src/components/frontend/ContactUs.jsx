import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Header from '../common/Header';
import Footer from '../common/Footer';
import HeroSection from '../common/HeroSection';
import { toastError, toastSuccess } from '../../admin/utils/alerts';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
]);

const scriptTagRegex = /<\s*\/?\s*script\b[^>]*>/i;

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name is too long')
    .regex(/^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/, 'Only letters are allowed in full name')
    .refine((value) => !scriptTagRegex.test(value), 'Scripting tags are not allowed'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email')
    .refine((value) => {
      const domain = value.split('@')[1] || '';
      return domain && !DISPOSABLE_EMAIL_DOMAINS.has(domain);
    }, 'Disposable email addresses are not allowed'),
  phone: z.string().trim().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  service: z.string().trim().min(1, 'Please select service'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long')
    .refine((value) => !scriptTagRegex.test(value), 'Scripting tags are not allowed'),
});

const defaultPageContent = {
  heroPreHeading: 'Get In Touch',
  heroHeading: 'Contact Us',
  heroText: "We're here to answer any questions you may have about our services.",
  formSectionTag: 'Send A Message',
  formHeading: "Let's Discuss Your Project Requirements",
  formDescription:
    'Fill out the form and our team will connect with you with the right construction solution.',
  callCardSubtitle: 'Mon - Sat, 9:00 AM - 7:00 PM',
  emailCardSubtitle: 'Response within 24 hours',
  addressCardSubtitle: 'Gujarat, India',
  mapTitle: 'Office Location',
  mapSubtitle: 'Our office location map',
  quickQuestions: [
    'Do you handle complete turnkey projects?',
    'Can you share timeline and cost estimate before start?',
    'Do you provide post-handover support?',
  ],
  serviceOptions: [
    'Residential Construction',
    'Commercial Projects',
    'Renovation & Remodeling',
    'Turnkey Solutions',
  ],
};

const defaultSettings = {
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
};

const ContactUs = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [pageContent, setPageContent] = useState(defaultPageContent);
  const [settings, setSettings] = useState(defaultSettings);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      service: '',
      message: '',
    },
  });

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contact-page-content/public`);
        const result = await response.json();
        if (response.ok && result?.success && result?.data) {
          setPageContent(result.data);
        }
      } catch {
        // Keep fallback content.
      }
    };

    fetchPageContent();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/public`);
        const result = await response.json();
        if (response.ok && result?.success && result?.data) {
          setSettings(result.data);
        }
      } catch {
        // Keep fallback settings.
      }
    };

    fetchSettings();
  }, [API_BASE_URL]);

  const contactInfo = useMemo(
    () => [
      {
        title: 'Call Us',
        value: settings.callNumber ? `+91 ${settings.callNumber}` : '+91 99999 99999',
        sub: pageContent.callCardSubtitle,
      },
      {
        title: 'Email Us',
        value: settings.email || 'info@example.com',
        sub: pageContent.emailCardSubtitle,
      },
      {
        title: 'Visit Office',
        value: settings.officeLocationName || settings.fullAddress || 'Ahmedabad, Gujarat',
        sub: pageContent.addressCardSubtitle,
      },
    ],
    [settings, pageContent],
  );

  const businessHours = useMemo(() => {
    const source = String(settings.businessHours || '').trim();
    if (!source) {
      return [
        'Monday - Friday: 9:00 AM - 7:00 PM',
        'Saturday: 9:00 AM - 5:00 PM',
        'Sunday: By Appointment',
      ];
    }
    return source
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }, [settings.businessHours]);

  const mapEmbedSrc = useMemo(() => {
    if (settings.mapEmbedUrl) return settings.mapEmbedUrl;
    if (settings.officeLat !== null && settings.officeLng !== null) {
      return `https://www.google.com/maps?q=${settings.officeLat},${settings.officeLng}&output=embed`;
    }
    return '';
  }, [settings.mapEmbedUrl, settings.officeLat, settings.officeLng]);

  const onSubmit = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Failed to submit inquiry');
        return;
      }

      toastSuccess('Inquiry submitted successfully');
      reset();
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  return (
    <>
      <Header />
      <main className="contact-page">
        <HeroSection preHeading={pageContent.heroPreHeading} heading={pageContent.heroHeading} text={pageContent.heroText} />

        <section className="contact-overview">
          <div className="container py-5">
            <div className="row g-4">
              {contactInfo.map((item) => (
                <div className="col-12 col-md-6 col-lg-4" key={item.title}>
                  <article className="contact-info-card">
                    <span className="contact-card-label">{item.title}</span>
                    <h4>{item.value}</h4>
                    <p>{item.sub}</p>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-main">
          <div className="container pb-5">
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="contact-form-box">
                  <div className="form-header">
                    <span className="section-tag">{pageContent.formSectionTag}</span>
                    <h2>{pageContent.formHeading}</h2>
                    <p>{pageContent.formDescription}</p>
                  </div>
                  <form className="contact-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <input type="text" className={`form-control ${errors.fullName ? 'is-invalid' : ''}`} placeholder="Full Name" {...register('fullName')} />
                        {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="Email Address" {...register('email')} />
                        {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <input type="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} placeholder="Phone Number" inputMode="numeric" maxLength={10} {...register('phone')} />
                        {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <select className={`form-select ${errors.service ? 'is-invalid' : ''}`} {...register('service')}>
                          <option value="">Service Interested In</option>
                          {pageContent.serviceOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        {errors.service && <div className="invalid-feedback d-block">{errors.service.message}</div>}
                      </div>
                      <div className="col-12">
                        <textarea className={`form-control ${errors.message ? 'is-invalid' : ''}`} rows="5" placeholder="Write your project details..." {...register('message')} />
                        {errors.message && <div className="invalid-feedback d-block">{errors.message.message}</div>}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="contact-side-grid">
                  <article className="contact-side-card">
                    <h4>Business Hours</h4>
                    <ul>
                      {businessHours.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="contact-side-card">
                    <h4>Quick Questions</h4>
                    <ul>
                      {pageContent.quickQuestions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="contact-map-card">
                    <h4>{pageContent.mapTitle}</h4>
                    <p>{settings.fullAddress || pageContent.mapSubtitle}</p>
                    {mapEmbedSrc ? (
                      <iframe
                        title="Office map"
                        src={mapEmbedSrc}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="map-placeholder"
                        style={{ border: 0, width: '100%', minHeight: '170px' }}
                      />
                    ) : (
                      <div className="map-placeholder">Map Preview Area</div>
                    )}
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactUs;
