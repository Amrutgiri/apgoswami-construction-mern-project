import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastSuccess } from '../utils/alerts';
import { isAdminAuthenticated } from '../utils/auth';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = (values) => {
    console.log('Forgot password payload', values);
    toastSuccess('Password reset link sent to your email');
    reset();
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <h1>Forgot Password</h1>
          <p>Enter your admin email and we will send password reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="admin-login-form" noValidate>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email')}
              placeholder="admin@example.com"
            />
            {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="admin-auth-links mt-3">
          <Link to="/admin/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
