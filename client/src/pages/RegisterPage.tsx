import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authApi } from '../api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '' as 'male' | 'female' | 'other' | '',
  });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    try {
      const registerData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (formData.age) {
        registerData.age = parseInt(formData.age);
      }

      if (formData.gender) {
        registerData.gender = formData.gender;
      }

      await register(registerData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleGoogleLogin = () => {
    authApi.googleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-tinder p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-tinder bg-clip-text text-transparent">
              Loco
            </h1>
            <p className="text-tinder-gray mt-2">Create your account</p>
          </div>

          {/* Error Message */}
          {(error || formError) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error || formError}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-tinder-dark mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-tinder-dark mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-tinder-dark mb-2">
                  Age (Optional)
                </label>
                <input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                  placeholder="Age"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-tinder-dark mb-2">
                  Gender (Optional)
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-tinder-dark mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-tinder-dark mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-tinder text-white py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-tinder-gray">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-tinder-dark py-3 rounded-full font-semibold hover:bg-gray-50 hover:shadow-md transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-tinder-gray">
            Already have an account?{' '}
            <Link to="/login" className="text-tinder-primary font-semibold hover:text-tinder-secondary transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
