import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toastError } from '../utils/alerts';

function AdminNotFoundPage() {
  useEffect(() => {
    toastError('Route not found');
  }, []);

  return (
    <section className="admin-card text-center">
      <h2 className="mb-2">404 - Page Not Found</h2>
      <p className="mb-3">This admin route does not exist.</p>
      <Link to="/admin" className="btn btn-primary">
        Back To Dashboard
      </Link>
    </section>
  );
}

export default AdminNotFoundPage;
