import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authApi } from '../api';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        navigate('/login', { state: { error: 'Google authentication failed' } });
        return;
      }

      try {
        localStorage.setItem('accessToken', token);
        
        // Fetch user details
        const userResponse = await authApi.getCurrentUser();
        setAuth(token, userResponse.data);
        
        navigate('/');
      } catch (error) {
        console.error('Google callback error:', error);
        navigate('/login', { state: { error: 'Failed to complete Google authentication' } });
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-tinder">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tinder-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-tinder-dark">Completing authentication...</h2>
          <p className="text-tinder-gray mt-2">Please wait while we log you in.</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
