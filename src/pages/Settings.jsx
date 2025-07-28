import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Lock, Shield, AlertTriangle } from 'lucide-react';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onPasswordSubmit = async (data) => {
    setPasswordError('');
    setPasswordSuccess('');
    setLoading(true);
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      setPasswordSuccess('Password changed successfully!');
      resetPassword();
    } catch (err) {
      setPasswordError(
        err.response?.data?.message || 'Failed to change password. Please check your current password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and security preferences</p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-gray-600" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          {passwordSuccess && (
            <Alert variant="success" className="mb-4" onClose={() => setPasswordSuccess('')}>
              {passwordSuccess}
            </Alert>
          )}
          {passwordError && (
            <Alert variant="error" className="mb-4" onClose={() => setPasswordError('')}>
              {passwordError}
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 mt-6" />
                <Input
                  {...registerPassword('currentPassword')}
                  type="password"
                  label="Current Password"
                  className="pl-10"
                  error={passwordErrors.currentPassword?.message}
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 mt-6" />
                <Input
                  {...registerPassword('newPassword')}
                  type="password"
                  label="New Password"
                  className="pl-10"
                  error={passwordErrors.newPassword?.message}
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 mt-6" />
                <Input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  label="Confirm New Password"
                  className="pl-10"
                  error={passwordErrors.confirmPassword?.message}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          {twoFactorSuccess && (
            <Alert variant="success" className="mb-4" onClose={() => setTwoFactorSuccess('')}>
              {twoFactorSuccess}
            </Alert>
          )}
          {twoFactorError && (
            <Alert variant="error" className="mb-4" onClose={() => setTwoFactorError('')}>
              {twoFactorError}
            </Alert>
          )}

          <div className="space-y-4">
            {/* 2FA Setting */}
            <div className="py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary-600" />
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500">
                    {twoFactorEnabled
                      ? 'Your account is protected with 2FA'
                      : 'Add an extra layer of security to your account'}
                  </p>
                </div>
                <div className="space-x-2">
                  {!twoFactorEnabled ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/settings/2fa')}
                      loading={twoFactorLoading}
                    >
                      Enable
                    </Button>
                  ) : (
                    <>
                      {!showDisableForm && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => setShowDisableForm(true)}
                        >
                          Disable
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Disable 2FA Form */}
              {showDisableForm && twoFactorEnabled && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="font-medium text-sm">Disable Two-Factor Authentication</p>
                  </div>
                  <p className="text-sm text-red-600 mb-3">
                    This will reduce your account security. Enter your password to confirm.
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={disablePassword}
                      onChange={(e) => setDisablePassword(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        loading={twoFactorLoading}
                        onClick={async () => {
                          if (!disablePassword) {
                            setTwoFactorError('Password is required');
                            return;
                          }
                          setTwoFactorError('');
                          setTwoFactorLoading(true);
                          try {
                            await authService.disable2FA(disablePassword);
                            setTwoFactorEnabled(false);
                            setShowDisableForm(false);
                            setDisablePassword('');
                            setTwoFactorSuccess('Two-factor authentication has been disabled.');
                          } catch (err) {
                            setTwoFactorError(
                              err.response?.data?.message || 'Failed to disable 2FA'
                            );
                          } finally {
                            setTwoFactorLoading(false);
                          }
                        }}
                      >
                        Confirm Disable
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowDisableForm(false);
                          setDisablePassword('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Active Sessions</p>
                <p className="text-sm text-gray-500">View and manage your active sessions</p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

