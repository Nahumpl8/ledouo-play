import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authStorage } from '../../lib/storage';

export const RequireAuth = ({ children }) => {
  const isLoggedIn = authStorage.isLoggedIn();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login page with return url
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  return children;
};