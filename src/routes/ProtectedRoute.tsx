import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../state/authStore';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
