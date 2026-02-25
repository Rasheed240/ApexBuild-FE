import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Building2, Mail, Lock, ArrowRight, Shield, Eye, EyeOff,
  CheckCircle, HardHat, BarChart3, Users, Star, Sun, Moon,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const FEATURES = [
  { icon: BarChart3, text: 'Real-time project analytics & dashboards' },
  { icon: Users, text: 'Multi-role team management with full RBAC' },
  { icon: HardHat, text: 'Contractor & department oversight built-in' },
  { icon: Shield, text: 'Enterprise-grade security & audit logs' },
];

const STATS = [
  { value: '500+', label: 'Active Projects' },
  { value: '12k+', label: 'Team Members' },
  { value: '99.9%', label: 'Uptime SLA' },
];

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: localStorage.getItem('rememberMe') === 'true',
      email: localStorage.getItem('rememberMe') === 'true' ? localStorage.getItem('rememberedEmail') || '' : '',
    },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      const response = await login(data.email, data.password);
      if (response.data.requiresTwoFactorAuthentication) {
        navigate('/verify-2fa', { state: { email: data.email, twoFactorToken: response.data.twoFactorToken } });
      } else {
        navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left brand panel ────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-950" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 15%, rgba(14,165,233,0.12) 0%, transparent 55%)',
        }} />
        {/* Blueprint grid */}
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Logo */}
        <div className="relative z-10">
          <picture>
            <source srcSet="/apexbuild-image.webp" type="image/webp" />
            <img src="/apexbuild-image.png" alt="ApexBuild" className="w-64 object-contain" loading="eager" fetchPriority="high" />
          </picture>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-semibold mb-7 tracking-wide">
            <Star className="h-3 w-3 fill-primary-400" />
            Trusted by leading construction firms
          </div>
          <h1 className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Build More.<br />
            <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Manage Less.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
            The enterprise platform that connects project owners, contractors, and field teams in one unified workspace.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3.5 group">
                <div className="flex-shrink-0 w-8 h-8 bg-slate-800/70 border border-slate-700/50 rounded-lg flex items-center justify-center group-hover:border-primary-500/40 transition-colors duration-200">
                  <Icon className="h-4 w-4 text-primary-400" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 flex items-center gap-10 pt-8 border-t border-slate-800/60">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile brand header (hidden on desktop) ─────────────────── */}
      <div className="lg:hidden relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-950" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(14,165,233,0.13) 0%, transparent 55%)',
        }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-8">
          <picture>
            <source srcSet="/apexbuild-image.webp" type="image/webp" />
            <img src="/apexbuild-image.png" alt="ApexBuild" className="h-20 object-contain mb-4" loading="eager" fetchPriority="high" />
          </picture>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-xs font-semibold mb-3 tracking-wide">
            <Star className="h-3 w-3 fill-primary-400" />
            Trusted by leading construction firms
          </div>
          <h1 className="text-2xl font-black text-white leading-tight mb-1">
            Build More. <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">Manage Less.</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xs">
            The enterprise platform for project owners, contractors &amp; field teams.
          </p>
          {/* Mini stats */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-800/70 w-full justify-center">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-lg font-black text-white">{value}</div>
                <div className="text-[10px] text-slate-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white dark:bg-slate-950 relative">
        {/* Background glow (dark only) */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-[#090e1a]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Theme toggle – desktop only in form panel; mobile uses hero toggle above */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 z-10 p-2 rounded-lg bg-gray-100 dark:bg-slate-800/60 hover:bg-gray-200 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700/50 text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-all hidden lg:block"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-full max-w-[400px] relative z-10">
          <div className="mb-9">
            <h2 className="text-[2rem] font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-2">Welcome back</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Sign in to your ApexBuild workspace</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 mt-1.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '16px', height: '16px' }} />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200
                    bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600
                    ${errors.email
                      ? 'border-2 border-red-400 dark:border-red-500/50 focus:border-red-500'
                      : 'border border-gray-200 dark:border-slate-700/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '16px', height: '16px' }} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-3.5 rounded-xl text-sm font-medium outline-none transition-all duration-200
                    bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600
                    ${errors.password
                      ? 'border-2 border-red-400 dark:border-red-500/50 focus:border-red-500'
                      : 'border border-gray-200 dark:border-slate-700/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group py-0.5">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-5 h-5 rounded-md bg-gray-100 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 text-primary-600 focus:ring-0 cursor-pointer transition-colors checked:bg-primary-600 checked:border-primary-600"
                />
              </div>
              <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:text-gray-800 dark:group-hover:text-slate-200 transition-colors font-medium select-none">
                Keep me signed in for 7 days
              </span>
            </label>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 mt-1 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 active:from-primary-700 active:to-blue-700 disabled:from-gray-300 dark:disabled:from-slate-700 disabled:to-gray-300 dark:disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
            <span className="text-xs text-gray-400 dark:text-slate-600 font-medium whitespace-nowrap">Don't have an account?</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
          </div>

          <Link
            to="/register"
            className="w-full py-3.5 flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500/60 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/5 transition-all duration-200 group"
          >
            Create your free account
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <p className="text-center text-xs text-gray-400 dark:text-slate-700 mt-7 flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            256-bit SSL · SOC 2 Type II Compliant
          </p>
        </div>
      </div>
    </div>
  );
};
