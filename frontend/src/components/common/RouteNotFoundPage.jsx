import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toastError } from '../../admin/utils/alerts';

function RouteNotFoundPage() {
  useEffect(() => {
    toastError('Route not found');
  }, []);

  return (
    <div className="container py-5 text-center">
      <h1 className="mb-2">404</h1>
      <p className="mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">
        Back To Home
      </Link>
    </div>
  );
}

export default RouteNotFoundPage;
