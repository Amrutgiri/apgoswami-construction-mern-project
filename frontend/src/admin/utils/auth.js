const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';
const LEGACY_ADMIN_AUTH_KEY = 'admin_auth';

export const isAdminAuthenticated = () => Boolean(localStorage.getItem(ADMIN_TOKEN_KEY));

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const getAdminUser = () => {
  const rawUser = localStorage.getItem(ADMIN_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const setAdminSession = ({ token, admin }) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
};

export const clearAdminAuthenticated = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem(LEGACY_ADMIN_AUTH_KEY);
};
