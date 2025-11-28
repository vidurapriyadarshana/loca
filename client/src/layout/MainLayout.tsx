import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const MainLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-tinder-light">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-tinder bg-clip-text text-transparent">
              Loco
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-tinder-gray">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gradient-tinder text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
