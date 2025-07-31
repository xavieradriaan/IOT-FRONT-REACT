import {
  Analytics,
  Dashboard as DashboardIcon,
  DevicesOther,
  Notifications,
  People,
  Refresh,
  Timeline,
  TrendingUp,
  EventNote,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Fade,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickStats = [
    {
      title: 'Dispositivos Activos',
      value: '3',
      change: '+2',
      trend: 'up',
      icon: <DevicesOther />,
      color: 'primary',
    },
    {
      title: 'Empleados Registrados',
      value: '2',
      change: '+2',
      trend: 'up',
      icon: <People />,
      color: 'success',
    },
    {
      title: 'Asistencias Hoy',
      value: '18',
      change: '-2',
      trend: 'down',
      icon: <Timeline />,
      color: 'warning',
    },
    {
      title: 'Uptime Sistema',
      value: '99.8%',
      change: '+0.1%',
      trend: 'up',
      icon: <TrendingUp />,
      color: 'info',
    },
  ];

  const navigationCards = [
    {
      title: 'Registros de Asistencia',
      description: 'Visualiza el historial completo de marcaciones biométricas almacenadas en la base de datos.',
      icon: <EventNote sx={{ fontSize: 40 }} />,
      path: '/attendance',
      color: 'success',
      requiredRole: null,
    },
    {
      title: 'Métricas del Sistema',
      description: 'Visualiza las métricas en tiempo real de los dispositivos IoT y el rendimiento del sistema.',
      icon: <Analytics sx={{ fontSize: 40 }} />,
      path: '/metrics',
      color: 'primary',
      requiredRole: null,
    },
    {
      title: 'Dashboard de Grafana',
      description: 'Accede a los dashboards avanzados de Grafana con gráficos detallados y análisis históricos.',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      path: '/grafana',
      color: 'secondary',
      requiredRole: 'user',
    },
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Fade in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={700}>
            ¡Bienvenido, {user?.username}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Sistema de Control de Asistencia Biométrica IoT
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Rol: ${user?.role?.toUpperCase()}`}
              color="primary"
              variant="filled"
            />
            <Chip
              icon={<Notifications />}
              label="Sistema Operativo"
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>
      </Fade>

      {/* Quick Stats */}
      <Fade in timeout={800}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickStats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
                      : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${stat.color}.main`,
                        mr: 2,
                        width: 48,
                        height: 48,
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      label={stat.change}
                      size="small"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      variant="outlined"
                    />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      desde ayer
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Navigation Cards */}
      <Fade in timeout={1000}>
        <Grid container spacing={3}>
          {navigationCards.map((card, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                        : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: `${card.color}.main`,
                        mr: 2,
                        width: 56,
                        height: 56,
                      }}
                    >
                      {card.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {card.title}
                      </Typography>
                      {card.requiredRole && (
                        <Chip
                          label={`Requiere: ${card.requiredRole}`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {card.description}
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{ mb: 1, borderRadius: 2, height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Sistema operativo al 85%
                  </Typography>
                </CardContent>
                
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant="contained"
                    color={card.color as any}
                    onClick={() => navigate(card.path)}
                    sx={{ mr: 1 }}
                    fullWidth
                  >
                    Acceder
                  </Button>
                  <IconButton color="primary">
                    <Refresh />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Fade>
    </Box>
  );
};

export default Dashboard;
