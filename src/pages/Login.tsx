import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with:', { email });
      
      // For demo purposes, allow login with demo credentials without Supabase
      if (email === 'demo@boothbuzz.com' && password === 'demo123') {
        // Create a mock user
        const mockUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'demo@boothbuzz.com',
          name: 'Demo User',
          role: 'super_admin',
          city: 'Mumbai',
          phone: '+91-9876543200',
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Store in localStorage to simulate login
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
        return;
      }
      
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
        console.log('Login failed: Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900">Booth Buzz</h2>
            <p className="mt-2 text-sm text-gray-600">Admin Portal</p>
          </div>

          <form className="mt-6 sm:mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              <p className="mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs bg-gray-100 p-2 rounded">
                <p><strong>Super Admin:</strong> admin@boothbuzz.com / admin123</p>
                <p><strong>Demo User:</strong> demo@boothbuzz.com / demo123</p>
              </div>
              <button 
                onClick={() => {
                  setEmail('demo@boothbuzz.com');
                  setPassword('demo123');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
              >
                Fill Demo Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};