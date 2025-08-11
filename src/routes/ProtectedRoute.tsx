import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { useEffect } from 'react';

export default function ProtectedRoute() {
  const { user, loading, hydrate } = useAuth();
  useEffect(() => { hydrate(); }, []);
  if (loading) return null;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
