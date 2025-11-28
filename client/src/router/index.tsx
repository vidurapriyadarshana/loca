import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layout';
import { 
  HomePage, 
  LoginPage, 
  RegisterPage, 
  ForgotPasswordPage, 
  ResetPasswordPage,
  GoogleCallbackPage 
} from '../pages';
import { ProtectedRoute } from '../components';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleCallbackPage />,
  },
  // Protected routes
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
