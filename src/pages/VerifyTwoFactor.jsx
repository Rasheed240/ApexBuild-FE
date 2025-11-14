import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Lock, MessageSquare } from 'lucide-react';
import api from '../services/api';

const totpSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

const backupCodeSchema = z.object({
  code: z.string().min(1, 'Backup code is required'),
});

export const VerifyTwoFactor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationTab, setVerificationTab] = useState('totp');

  const email = location.state?.email;
  const twoFactorToken = location.state?.twoFactorToken;

  // TOTP form
  const {
    register: registerTotp,
    handleSubmit: handleSubmitTotp,
    formState: { errors: errorsTotp },
  } = useForm({
    resolver: zodResolver(totpSchema),
  });

  // Backup Code form
  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    formState: { errors: errorsBackup },
  } = useForm({
    resolver: zodResolver(backupCodeSchema),
  });

  if (!email || !twoFactorToken) {
    return (
      <AuthLayout>
        <Card>
          <CardContent className="pt-6">
            <Alert variant="error">
              Invalid session. Please login again.
            </Alert>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  const onSubmitTotp = async (data) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/authentication/2fa/verify-token', {
        email,
        code: data.code,
        isBackupCode: false,
      });

      const { accessToken, refreshToken, user, expiresAt } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokenExpiresAt', expiresAt);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid authentication code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitBackup = async (data) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/authentication/2fa/verify-token', {
        email,
        code: data.code,
        isBackupCode: true,
      });

      const { accessToken, refreshToken, user, expiresAt } = response.data.data;
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('tokenExpiresAt', expiresAt);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid backup code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="animate-fade-in shadow-xl max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <Lock className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Enter your authentication code to continue</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="error" className="mb-4" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Tabs value={verificationTab} onValueChange={setVerificationTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="totp">Authenticator App</TabsTrigger>
              <TabsTrigger value="backup">Backup Code</TabsTrigger>
            </TabsList>

            <TabsContent value="totp" className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter the 6-digit code from your authenticator app.
              </p>
              <form onSubmit={handleSubmitTotp(onSubmitTotp)} className="space-y-4">
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...registerTotp('code')}
                      type="text"
                      placeholder="000000"
                      maxLength="6"
                      className="pl-10 text-center text-2xl tracking-widest font-mono"
                      error={errorsTotp.code?.message}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={loading} size="lg">
                  Verify
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter one of your backup codes. Each code can only be used once.
              </p>
              <form onSubmit={handleSubmitBackup(onSubmitBackup)} className="space-y-4">
                <div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      {...registerBackup('code')}
                      type="text"
                      placeholder="Enter backup code"
                      className="pl-10"
                      error={errorsBackup.code?.message}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" loading={loading} size="lg">
                  Verify
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Lost access to your authenticator? Use a backup code to regain access.
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
