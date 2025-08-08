import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(state => state.login.isAuthenticated);
  const token = sessionStorage.getItem('token'); // Match what loginSaga stores
  const location = useLocation();

  if (!isAuthenticated || !token) {
    // Redirect to login, preserve the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
