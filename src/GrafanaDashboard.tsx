import {
  Fullscreen,
  FullscreenExit,
  OpenInNew,
  Refresh,
  Settings,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

const GrafanaDashboard = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [grafanaUrl, setGrafanaUrl] = useState('http://localhost:3000/d/cetcrvckqw5xca/new-dashboard?orgId=1&from=1753736814421&to=1753758414421')
  const [iframeKey, setIframeKey] = useState(0);
  const theme = useTheme();

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const refreshDashboard = () => {
    setIframeKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    window.open(grafanaUrl, '_blank');
  };

  const handleUrlSave = () => {
    setIframeKey(prev => prev + 1);
    setIsSettingsOpen(false);
  };

  const dashboardHeight = isFullscreen ? '100vh' : '70vh';
  const containerStyle = isFullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: theme.palette.background.default,
  } : {};

  return (
    <Box sx={containerStyle}>
      {!isFullscreen && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard de Grafana
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualización avanzada de métricas y análisis históricos
          </Typography>
        </Box>
      )}

      <Card
        sx={{
          height: isFullscreen ? '100%' : 'auto',
          boxShadow: isFullscreen ? 'none' : 3,
        }}
      >
        {/* Header Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              IoT Biometric Dashboard
            </Typography>
            <Chip
              label="En vivo"
              color="success"
              size="small"
              variant="filled"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Configurar URL">
              <IconButton onClick={() => setIsSettingsOpen(true)} size="small">
                <Settings />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Actualizar dashboard">
              <IconButton onClick={refreshDashboard} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Abrir en nueva pestaña">
              <IconButton onClick={openInNewTab} size="small">
                <OpenInNew />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
              <IconButton onClick={toggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ p: 0, height: dashboardHeight }}>
          {grafanaUrl ? (
            <iframe
              key={iframeKey}
              src={grafanaUrl}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                borderRadius: isFullscreen ? 0 : '0 0 12px 12px',
              }}
              title="Grafana Dashboard"
              allowFullScreen
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Alert severity="warning">
                <Typography variant="h6" gutterBottom>
                  Dashboard no configurado
                </Typography>
                <Typography variant="body2">
                  Por favor, configura la URL de Grafana para mostrar el dashboard.
                </Typography>
              </Alert>
              <Button
                variant="contained"
                onClick={() => setIsSettingsOpen(true)}
                startIcon={<Settings />}
              >
                Configurar Dashboard
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuración del Dashboard</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="URL de Grafana"
            value={grafanaUrl}
            onChange={(e) => setGrafanaUrl(e.target.value)}
            placeholder="http://localhost:3000/d/dashboard-id"
            sx={{ mt: 2 }}
            helperText="Ingresa la URL completa del dashboard de Grafana que deseas mostrar"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSettingsOpen(false)}>Cancelar</Button>
          <Button onClick={handleUrlSave} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GrafanaDashboard;
