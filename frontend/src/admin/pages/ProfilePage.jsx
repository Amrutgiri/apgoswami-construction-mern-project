import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastSuccess } from '../utils/alerts';

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9()\-\s]{8,20}$/, 'Please enter a valid phone number'),
});

function ProfilePage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: 'Admin User',
      email: 'admin@buildops.com',
      phone: '+91 98765 43210',
      role: 'Super Admin',
    },
  });

  const onSubmit = (values) => {
    console.log('Profile update payload', values);
    toastSuccess('Profile updated successfully');
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Update Profile</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="admin-form-grid" noValidate>
        <div>
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
            {...register('fullName')}
          />
          {errors.fullName && (
            <div className="invalid-feedback d-block">{errors.fullName.message}</div>
          )}
        </div>

        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email')}
          />
          {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
        </div>

        <div>
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            {...register('phone')}
          />
          {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
        </div>

        <div>
          <label className="form-label">Role</label>
          <input type="text" className="form-control" value="Super Admin" disabled />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfilePage;
