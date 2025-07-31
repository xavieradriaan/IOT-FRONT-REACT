import {
  AccessTime,
  Download,
  EventNote,
  FilterList,
  Person,
  Refresh,
  Visibility,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useState } from 'react';
import LoadingSpinner from './components/Common/LoadingSpinner';
import { useAuth } from './context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface AttendanceRecord {
  id: number;
  employee_name: string;
  event_type: string;
  event_date: string;
  timestamp: string;
  device_id: string;
  raw_payload: string;
}

interface AttendanceStats {
  total_records: number;
  today_records: number;
  unique_employees: number;
}

const Attendance: React.FC = () => {
  const { token } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch attendance records
  const {
    data: attendanceData,
    isLoading: recordsLoading,
    error: recordsError,
    refetch: refetchRecords,
  } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch attendance stats
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/attendance/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchRecords();
    refetchStats();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'entrada':
      case 'entry':
        return 'success';
      case 'salida':
      case 'exit':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (recordsLoading || statsLoading) {
    return <LoadingSpinner message="Cargando registros de asistencia..." />;
  }

  if (recordsError || statsError) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }
      >
        Error al cargar los datos de asistencia
      </Alert>
    );
  }

  const records: AttendanceRecord[] = attendanceData?.data || [];
  const stats: AttendanceStats = statsData || { total_records: 0, today_records: 0, unique_employees: 0 };

  // Paginated records
  const paginatedRecords = records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Registros de Asistencia
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historial completo de marcaciones biométricas almacenadas en base de datos
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Actualizar datos">
            <IconButton onClick={handleRefresh} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar registros">
            <IconButton color="primary">
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filtros">
            <IconButton color="primary">
              <FilterList />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
                  <EventNote />
                </Avatar>
                <Typography variant="h6">Total Registros</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="primary">
                {stats.total_records}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Marcaciones almacenadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 1 }}>
                  <AccessTime />
                </Avatar>
                <Typography variant="h6">Hoy</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats.today_records}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Marcaciones de hoy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                  <Person />
                </Avatar>
                <Typography variant="h6">Empleados</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {stats.unique_employees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empleados registrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Records Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Últimas Marcaciones ({records.length} registros)
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Empleado</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Dispositivo</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{record.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.875rem' }}>
                          {record.employee_name.charAt(0).toUpperCase()}
                        </Avatar>
                        {record.employee_name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={record.event_type.toUpperCase()}
                        color={getEventTypeColor(record.event_type) as any}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{record.event_date}</TableCell>
                    <TableCell>{formatTimestamp(record.timestamp)}</TableCell>
                    <TableCell>
                      <Chip label={record.device_id} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(record)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={records.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Detalles de Marcación #{selectedRecord?.id}
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Empleado
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedRecord.employee_name}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Evento
                  </Typography>
                  <Chip
                    label={selectedRecord.event_type.toUpperCase()}
                    color={getEventTypeColor(selectedRecord.event_type) as any}
                    size="small"
                  />
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1">{selectedRecord.event_date}</Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hora Exacta
                  </Typography>
                  <Typography variant="body1">
                    {formatTimestamp(selectedRecord.timestamp)}
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dispositivo
                  </Typography>
                  <Typography variant="body1">{selectedRecord.device_id}</Typography>
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payload Original (MQTT)
                  </Typography>
                  <Paper sx={{ p: 1, bgcolor: 'grey.100', mt: 1 }}>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedRecord.raw_payload || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleRefresh}
      >
        <Refresh />
      </Fab>
    </Box>
  );
};

export default Attendance;