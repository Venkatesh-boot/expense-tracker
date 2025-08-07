import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('authToken');
  const location = useLocation();

  if (!token) {
    // Redirect to login, preserve the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
