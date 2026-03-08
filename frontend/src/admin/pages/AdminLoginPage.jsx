import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toastError, toastSuccess } from '../utils/alerts';
import { isAdminAuthenticated, setAdminSession } from '../utils/auth';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || '/admin';
  const [showPassword, setShowPassword] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toastError(result?.message || 'Invalid credentials');
        return;
      }

      const token = result?.data?.token;
      const admin = result?.data?.admin;

      if (!token || !admin) {
        toastError('Invalid response from server');
        return;
      }

      setAdminSession({ token, admin });
      toastSuccess('Login successful');
      navigate(redirectPath, { replace: true });
    } catch {
      toastError('Unable to connect server. Please try again.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-head">
          <h1>Admin Login</h1>
          <p>Sign in to access your admin dashboard.</p>
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

          <div>
            <label className="form-label">Password</label>
            <div className="admin-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                {...register('password')}
                placeholder="Enter password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password.message}</div>
            )}
          </div>

          <div className="admin-auth-links">
            <Link to="/admin/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
