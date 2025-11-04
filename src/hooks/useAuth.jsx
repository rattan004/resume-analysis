import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // 1. Import PropTypes to fix the Error
import api from '../services/api';

const AuthContext = createContext();

// WARNING: 6:14 Fast refresh only works when a file only exports components.
// To fix this warning, move the 'useAuth' hook into a separate file (e.g., 'use-auth.js')

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await api.login({ email, password });
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const data = await api.register({ name, email, password });
      
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getProfile()
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => { // Ensure loading is set to false after API call, regardless of success
            setLoading(false);
        });
    } else {
        setLoading(false); // Set loading false if no token is found
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 2. Add PropTypes validation (Fixes Error: 14:32 'children' is missing)
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};