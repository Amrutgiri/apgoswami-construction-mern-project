import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastSuccess } from '../utils/alerts';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from current password',
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Confirm password does not match',
  });

function ChangePasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values) => {
    console.log('Change password payload', values);
    reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    toastSuccess('Password changed successfully');
  };

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Change Password</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="admin-form-grid" noValidate>
        <div>
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <div className="invalid-feedback d-block">{errors.currentPassword.message}</div>
          )}
        </div>

        <div>
          <label className="form-label">New Password</label>
          <input
            type="password"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            {...register('newPassword')}
          />
          {errors.newPassword && (
            <div className="invalid-feedback d-block">{errors.newPassword.message}</div>
          )}
        </div>

        <div>
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>
          )}
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChangePasswordPage;
