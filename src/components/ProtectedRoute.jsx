import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const accessToken = useSelector((s) => s.auth.accessToken);
  const refreshToken = useSelector((s) => s.auth.refreshToken);

  if (!accessToken && !refreshToken) return <Navigate to="/login" replace />;
  return children;
}
