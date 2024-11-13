import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('username');

  if (!isLoggedIn) {
    // Redirect to login if the user is not logged in
    return <Navigate to="/login" replace />;
  }

  // Allow access to the protected route if logged in
  return children;
};

export default ProtectedRoute;
