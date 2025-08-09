import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactElement; requireAdmin?: boolean; }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-black dark:text-white">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
} 