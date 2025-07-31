import {
  Computer,
  Download,
  ExpandMore,
  Memory,
  Refresh,
  Speed,
  Timeline,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { useAuth } from './context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface ParsedMetric {
  name: string;
  value: string;
  type: string;
  help?: string;
  labels?: Record<string, string>;
}

const Metrics: React.FC = () => {
  const { token } = useAuth();
  const [parsedMetrics, setParsedMetrics] = useState<ParsedMetric[]>([]);

  const {
    data: metricsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (typeof metricsData === 'string') {
      const parsed = parsePrometheusMetrics(metricsData);
      setParsedMetrics(parsed);
    }
  }, [metricsData]);

  const parsePrometheusMetrics = (data: string): ParsedMetric[] => {
    const lines = data.split('\n');
    const metrics: ParsedMetric[] = [];
    let currentHelp = '';
    let currentType = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        if (trimmed.startsWith('# HELP')) {
          currentHelp = trimmed.replace('# HELP ', '').split(' ').slice(1).join(' ');
        } else if (trimmed.startsWith('# TYPE')) {
          currentType = trimmed.split(' ')[3] || 'unknown';
        }
        return;
      }

      const spaceIndex = trimmed.lastIndexOf(' ');
      if (spaceIndex === -1) return;

      const metricPart = trimmed.substring(0, spaceIndex);
      const value = trimmed.substring(spaceIndex + 1);

      // Parse labels if present
      const braceIndex = metricPart.indexOf('{');
      let name = metricPart;
      let labels: Record<string, string> = {};

      if (braceIndex !== -1) {
        name = metricPart.substring(0, braceIndex);
        const labelsStr = metricPart.substring(braceIndex + 1, metricPart.lastIndexOf('}'));
        const labelPairs = labelsStr.split(',');
        labelPairs.forEach(pair => {
          const [key, val] = pair.split('=');
          if (key && val) {
            labels[key.trim()] = val.trim().replace(/"/g, '');
          }
        });
      }

      metrics.push({
        name,
        value,
        type: currentType,
        help: currentHelp,
        labels,
      });
    });

    return metrics;
  };

  const getMetricIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'counter':
        return <Timeline />;
      case 'gauge':
        return <Speed />;
      case 'histogram':
        return <Memory />;
      default:
        return <Computer />;
    }
  };

  const formatValue = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (num > 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num > 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const groupedMetrics = parsedMetrics.reduce((acc, metric) => {
    const baseName = metric.name.split('_')[0] || 'other';
    if (!acc[baseName]) acc[baseName] = [];
    acc[baseName].push(metric);
    return acc;
  }, {} as Record<string, ParsedMetric[]>);

  if (isLoading) {
    return <LoadingSpinner message="Cargando métricas del sistema..." />;
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={() => refetch()}>
            <Refresh />
          </IconButton>
        }
      >
        Error al cargar las métricas: {(error as any).message}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Métricas del Sistema
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitoreo en tiempo real de los dispositivos IoT y servicios
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Actualizar métricas">
            <IconButton onClick={() => refetch()} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar métricas">
            <IconButton color="primary">
              <Download />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {['biometric', 'esp32', 'employee'].map((category) => {
          const categoryMetrics = groupedMetrics[category] || [];
          const totalMetrics = categoryMetrics.length;
          const activeMetrics = categoryMetrics.filter(m => parseFloat(m.value) > 0).length;
          
          return (
            <Grid size={{ xs: 12, sm: 4 }} key={category}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getMetricIcon('gauge')}
                    <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
                      {category === 'esp32' ? 'Dispositivos ESP32' : 
                       category === 'biometric' ? 'Eventos Biométricos' : 'Empleados'}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    {activeMetrics}/{totalMetrics}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Métricas activas
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Detailed Metrics */}
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Métricas Detalladas
      </Typography>
      
      {Object.entries(groupedMetrics).map(([category, metrics]) => (
        <Accordion key={category} defaultExpanded={category === 'biometric'}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getMetricIcon(metrics[0]?.type || 'gauge')}
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {category} ({metrics.length} métricas)
              </Typography>
              <Chip
                size="small"
                label={`${metrics.filter(m => parseFloat(m.value) > 0).length} activas`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </AccordionSummary>
          
          <AccordionDetails>
            <Grid container spacing={2}>
              {metrics.map((metric, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {metric.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={metric.type}
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="h5" fontWeight={700} color="primary">
                      {formatValue(metric.value)}
                    </Typography>
                    
                    {metric.help && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {metric.help}
                      </Typography>
                    )}
                    
                    {Object.keys(metric.labels || {}).length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Divider sx={{ mb: 1 }} />
                        {Object.entries(metric.labels || {}).map(([key, value]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Raw Metrics (for debugging) */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Métricas Raw (Prometheus)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
            <Typography component="pre" variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
              {metricsData}
            </Typography>
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Metrics;
