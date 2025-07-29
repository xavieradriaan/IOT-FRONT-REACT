import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'viewer';
  exp: number;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<any>(token);
      return {
        id: decoded.sub || decoded.id || 'unknown',
        username: decoded.username || decoded.name || 'admin',
        role: decoded.role || 'admin',
        exp: decoded.exp || Date.now() / 1000 + 3600, // Default 1 hour if no exp
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<any>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username,
        password,
      });

      const { token } = response.data;
      
      // For demo purposes, create a mock JWT-like structure since backend returns "demo-token"
      const mockUser: User = {
        id: '1',
        username,
        role: username === 'admin' ? 'admin' : 'user',
        exp: Date.now() / 1000 + 3600, // 1 hour from now
      };

      setToken(token);
      setUser(mockUser);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Set default Authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Error de autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (!token) return;
      
      // In a real app, you'd call a refresh endpoint
      // For now, we'll just check if the current token is still valid
      if (user && user.exp * 1000 > Date.now()) {
        return; // Token still valid
      }
      
      // If token expired, logout
      logout();
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    // Role hierarchy: admin > user > viewer
    const roleHierarchy = { admin: 3, user: 2, viewer: 1 };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          
          // Check if token is expired
          if (parsedUser.exp * 1000 > Date.now()) {
            setToken(savedToken);
            setUser(parsedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          } else {
            // Token expired, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up token refresh interval
  useEffect(() => {
    if (token && user) {
      const interval = setInterval(() => {
        refreshToken();
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [token, user]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;