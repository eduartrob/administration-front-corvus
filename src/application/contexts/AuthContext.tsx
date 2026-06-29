import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config/api_config';

interface User {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('corvus_session') || sessionStorage.getItem('corvus_session');
    if (storedSession) {
      try {
        const { user, token } = JSON.parse(storedSession);
        setUser(user);
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Error parsing session", e);
      }
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      // -# llamada real al backend para obtener el jwt
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/login`, { 
        email, 
        password 
      });
      
      const { user, token } = response.data;
      
      setUser(user);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const sessionData = JSON.stringify({ user, token });
      if (rememberMe) {
        localStorage.setItem('corvus_session', sessionData);
      } else {
        sessionStorage.setItem('corvus_session', sessionData);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('corvus_session');
    sessionStorage.removeItem('corvus_session');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
