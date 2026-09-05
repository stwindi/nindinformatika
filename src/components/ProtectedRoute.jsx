import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}
