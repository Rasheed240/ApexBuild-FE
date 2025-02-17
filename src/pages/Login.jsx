import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Building2, Mail, Lock, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
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
      // Handle remember me functionality
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedEmail', data.email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }

      const response = await login(data.email, data.password);
      
      // Check if 2FA is required
      if (response.data.requiresTwoFactorAuthentication) {
        navigate('/verify-2fa', {
          state: {
            email: data.email,
            twoFactorToken: response.data.twoFactorToken,
          },
        });
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="animate-fade-in shadow-2xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-xl text-white overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <CardHeader className="text-center pb-8 pt-10 relative">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative p-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-white via-primary-100 to-blue-200 bg-clip-text text-transparent mb-2">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Sign in to continue to ApexBuild
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {error && (
            <Alert
              variant="error"
              className="mb-6 border-red-500/30 bg-red-500/10 backdrop-blur-sm"
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400" />
                Email Address
              </label>
              <div className="relative group">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  className="pl-4 pr-4 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl transition-all duration-200 hover:bg-gray-800/70"
                  error={errors.email?.message}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-400" />
                Password
              </label>
              <div className="relative group">
                <Input
                  {...register('password')}
                  showPasswordToggle
                  placeholder="Enter your password"
                  className="pl-4 h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl transition-all duration-200 hover:bg-gray-800/70"
                  error={errors.password?.message}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-5 h-5 rounded-md bg-gray-800/50 border-gray-700/50 text-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer transition-all"
                  />
                  {rememberMe && (
                    <CheckCircle2 className="absolute -top-1 -right-1 h-3 w-3 text-primary-400 animate-in zoom-in" />
                  )}
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 font-semibold transition-colors flex items-center gap-1 group"
              >
                Forgot password?
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 hover:from-primary-700 hover:via-primary-600 hover:to-blue-700 shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-base rounded-xl mt-8 group"
              loading={loading}
            >
              {!loading && (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs pt-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Secured with industry-standard encryption</span>
            </div>

            {/* Divider */}
            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900/80 text-gray-400 font-medium">New to ApexBuild?</span>
              </div>
            </div>

            {/* Create Account Link */}
            <Link
              to="/register"
              className="w-full h-12 flex items-center justify-center gap-2 px-4 border-2 border-gray-700/50 rounded-xl text-gray-200 hover:text-white hover:border-primary-500/50 hover:bg-primary-500/5 font-semibold transition-all duration-300 group backdrop-blur-sm"
            >
              Create New Account
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

