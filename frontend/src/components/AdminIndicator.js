import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const AdminIndicator = () => {
  const { user } = useAuth();
  const location = useLocation();
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