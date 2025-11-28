import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-tinder">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tinder-primary mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-tinder-dark">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
