import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setMessage('If an account exists with this email, you will receive a password reset link shortly.');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-tinder-gray mt-2">Reset your password</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {!message && (
            <>
              <p className="text-tinder-gray text-sm mb-6 text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-tinder-dark mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-tinder-primary focus:ring-2 focus:ring-tinder-primary/20 outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-tinder text-white py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {/* Back to Login Link */}
          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-tinder-primary font-semibold hover:text-tinder-secondary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
