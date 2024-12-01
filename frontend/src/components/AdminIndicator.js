import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const AdminIndicator = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [, forceUpdate] = useState({});
  
  useEffect(() => {
    const handleAuthChange = () => forceUpdate({});
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const isAdminSection = location.pathname.startsWith('/admin');
  if (!user || user.role !== 'admin' || isAdminSection) return null;

  return (
    <div className="admin-indicator">
      <i className="bi bi-shield-lock-fill"></i>
      Viewing as Admin
      <span className="ms-2 text-muted small">{user.email}</span>
    </div>
  );
};

export default AdminIndicator; 