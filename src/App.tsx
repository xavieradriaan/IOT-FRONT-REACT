import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from './theme/ThemeProvider';
import AuthProvider from './context/AuthContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './Dashboard';
import GrafanaDashboard from './GrafanaDashboard';
import Login from './Login';
import Metrics from './Metrics';
import Attendance from './Attendance';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/metrics"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Metrics />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Attendance />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/grafana"
                  element={
                    <ProtectedRoute requiredRole="user">
                      <AppLayout>
                        <GrafanaDashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
