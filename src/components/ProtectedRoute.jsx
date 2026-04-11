import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roleRequired }) => {
  const isAuth = localStorage.getItem('isAuth');
  const userRole = localStorage.getItem('role');

  // 1. Agar login nahi hai toh login page par bhej do
  if (isAuth !== 'true') {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar role match nahi karta (jaise staff admin page kholne ki koshish kare) toh login par bhej do
  if (roleRequired && userRole !== roleRequired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;