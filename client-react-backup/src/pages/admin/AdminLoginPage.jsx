import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both administrative email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);

      // Verify administrative privilege
      if (user?.role !== 'ADMIN') {
        await logout();
        setErrorMsg('Access Denied: Your account does not have administrator privileges.');
        addToast('Unauthorized: Administrator role required', 'error');
        return;
      }

      addToast('Administrator authenticated successfully');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Portal Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 shadow-2xl mx-auto flex items-center justify-center text-accent-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-accent-400 uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              <span>Restricted Access • Internal Operations</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Tez Thaila Admin Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Authorized personnel sign in to access catalog, order fulfillment &amp; analytics
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-gray-300 block mb-1.5">Administrator Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="admin@domain.com"
                  className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-slate-800 focus:border-accent-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-300 block mb-1.5">Security Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-slate-800 focus:border-accent-500 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-accent-500 hover:bg-accent-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-accent-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Enter Operations Central</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Storefront</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-600 mt-6">
          Tez Thaila Internal Systems • Restricted to Authorized Operations Personnel
        </p>
      </div>
    </div>
  );
}
