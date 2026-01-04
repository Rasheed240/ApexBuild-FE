import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Building2, Lock, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [email, token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!email || !token) {
      setError('Invalid reset link.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await authService.resetPassword(email, token, data.newPassword);
      setSuccess(response.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="animate-fade-in shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/apexbuild-logo.png" alt="ApexBuild" className="h-16 w-16 object-contain rounded-2xl shadow" />
          </div>
          <CardTitle>Set new password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  {...register('newPassword')}
                  type="password"
                  placeholder="New password"
                  className="pl-10"
                  error={errors.newPassword?.message}
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirm new password"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              size="lg"
              disabled={!email || !token}
            >
              Reset password
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

