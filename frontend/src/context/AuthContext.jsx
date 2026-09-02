import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    localStorage.getItem('accessToken'),
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch {
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = (accessToken, userData = null) => {
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);

    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'Admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);