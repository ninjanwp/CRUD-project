import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

const ProtectedRoute = ({ adminOnly = false, children }) => {
  const { token, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!token || !user) return <Navigate to="/login" replace />;
  
  if (adminOnly && (!user.role || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute; 