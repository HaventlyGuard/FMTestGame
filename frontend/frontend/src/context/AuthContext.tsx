import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import client from '../api/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      client.get('http://localhost:5081/api/auth/me')
        .then(r => setUser(r.data))
        .catch(() => { setToken(null); localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await client.post('http://localhost:5081/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({ id: res.data.userId, email: res.data.email, name: res.data.name, role: res.data.role });
      return null; // нет ошибки
    } catch (err: any) {
      return err.response?.data || 'Ошибка входа';
    }
  };

  const register = async (email: string, password: string, name: string): Promise<string | null> => {
    try {
      const res = await client.post('http://localhost:5081/api/auth/register', { email, password, name });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser({ id: res.data.userId, email: res.data.email, name: res.data.name, role: res.data.role });
      return null;
    } catch (err: any) {
      return err.response?.data || 'Ошибка регистрации';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);