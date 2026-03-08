import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import adminMenu from '../config/menu';
import { confirmAction, toastSuccess } from '../utils/alerts';
import { clearAdminAuthenticated, getAdminUser } from '../utils/auth';

function AdminLayout() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const displayName = adminUser?.name || 'Admin User';
  const displayRole = adminUser?.role || 'Super Admin';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const confirmed = await confirmAction({
      title: 'Logout now?',
      text: 'Your current admin session will be closed.',
      confirmText: 'Yes, logout',
    });

    if (!confirmed) {
      return;
    }

    setIsProfileOpen(false);
    clearAdminAuthenticated();
    toastSuccess('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          Build<span>Ops</span>
        </div>
        <nav className="admin-nav">
          {adminMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
           
          </div>
          <div className="admin-header-right">
            <div className="admin-profile" ref={dropdownRef}>
              <button
                type="button"
                className="admin-profile-trigger"
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName,
                  )}&background=1f2a44&color=ffffff`}
                  alt={displayName}
                />
                <span>
                  <strong>{displayName}</strong>
                  <small>{displayRole}</small>
                </span>
              </button>

              {isProfileOpen && (
                <div className="admin-profile-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/admin/profile');
                    }}
                  >
                    Update Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/admin/change-password');
                    }}
                  >
                    Change Password
                  </button>
                  <button type="button" className="danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
