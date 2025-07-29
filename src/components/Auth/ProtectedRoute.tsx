import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../Common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactElement;
  requiredRole?: string;
  fallback?: ReactElement;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return fallback;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Lock sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
        
        <Alert severity="warning" sx={{ maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Acceso Restringido
          </Typography>
          <Typography variant="body2">
            No tienes permisos suficientes para acceder a esta sección.
            Se requiere el rol: <strong>{requiredRole}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tu rol actual: <strong>{user?.role}</strong>
          </Typography>
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;