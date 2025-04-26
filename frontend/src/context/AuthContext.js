import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from local storage
    const checkLoggedIn = async () => {
      let storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        storedUser = JSON.parse(storedUser);
        setUser(storedUser);
        
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
      }
      
      setLoading(false);
    };
    
    checkLoggedIn();
  }, []);

  // Login user
  const login = async (username, password) => {
    try {
      const res = await axios.post('/api/auth/login', { username, password });
      
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        return res.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to login';
      toast.error(message);
      throw error;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        return res.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to register';
      toast.error(message);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user in state when profile is updated
  const updateUser = (updatedUser) => {
    if (user && updatedUser) {
      // Merge with current user data and preserve the token
      const newUserData = { ...user, ...updatedUser, token: updatedUser.token || user.token };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 