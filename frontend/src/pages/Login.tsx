import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">FoodFlow</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your account to continue.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@foodflow.com"
                required
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium text-sm py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400 space-y-1">
            <p>Demo accounts (password: <code className="bg-gray-100 px-1 rounded">password123</code>):</p>
            <p>
              <button onClick={() => { setEmail('admin@foodflow.com'); setPassword('password123'); }} className="text-primary-600 hover:underline">
                admin@foodflow.com
              </button>
              {' '}&middot;{' '}
              <button onClick={() => { setEmail('manager@foodflow.com'); setPassword('password123'); }} className="text-primary-600 hover:underline">
                manager@foodflow.com
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          FoodFlow Smart Inventory &amp; Delivery Platform
        </p>
      </div>
    </div>
  );
}
