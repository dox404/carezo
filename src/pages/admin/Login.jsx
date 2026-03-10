import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminLogin } from '../../api/index';
import { normalizeAuthResponse } from '../../utils/auth';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function AdminLogin() {
  // --- 1. State Management ---
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- 2. Hooks & Context ---
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // --- 3. Effects ---
  useEffect(() => {
    // Navigate away if already logged in as admin
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // --- 4. Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await adminLogin(form);
      const { token, user } = normalizeAuthResponse(res);
      login(token, user);
      toast.success(`Welcome, ${user.name}!`);
      navigate('/admin');
      
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Render ---
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[20rem] h-[20rem] sm:w-[30rem] sm:h-[30rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="w-full max-w-sm sm:max-w-md animate-fade-up z-10 flex flex-col items-center">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 duration-300">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="font-bold text-white text-3xl sm:text-4xl tracking-tight">Carezo</h1>
          <p className="text-zinc-400 text-sm mt-2 font-medium">Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="font-semibold text-white text-xl mb-6">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email" 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600"
                  placeholder="admin@carezo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'} 
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 hover:border-zinc-700 transition-all duration-200 placeholder-zinc-600"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-4 py-3.5 mt-4 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-xs mt-8 flex items-center gap-1.5 justify-center">
          <Shield size={12} />
          Carezo Admin · Secure Access Only
        </p>
      </div>
    </div>
  );
}
