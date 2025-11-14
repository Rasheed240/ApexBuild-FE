import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Shield, Copy, Check, Download, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const enableSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

export const SetupTwoFactor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('password'); // password, setup, verify
  const [setupData, setSetupData] = useState(null);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: zodResolver(enableSchema),
  });

  // Verify form
  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: errorsVerify },
  } = useForm({
    resolver: zodResolver(verifySchema),
  });

  const onSubmitPassword = async (data) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/authentication/2fa/enable', {
        password: data.password,
      });

      setSetupData(response.data.data);
      setStep('setup');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitVerify = async (data) => {
    setError('');
    setLoading(true);
    try {
      await api.post('/authentication/2fa/verify-setup', {
        code: data.code,
      });

      setSuccess('Two-factor authentication has been successfully enabled!');
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codes = setupData.backupCodes.join('\n');
    navigator.clipboard.writeText(codes);
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  const downloadBackupCodes = () => {
    const codes = setupData.backupCodes.join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(codes));
    element.setAttribute('download', `ApexBuild-2FA-Backup-Codes-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {step === 'password' && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" />
              <div>
                <CardTitle>Enable Two-Factor Authentication</CardTitle>
                <CardDescription>Enhance your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Two-factor authentication adds an extra layer of security to your account. You'll need to provide a code from your authenticator app in addition to your password when logging in.
              </p>
            </div>

            {error && (
              <Alert variant="error" className="mb-4" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to continue
                </label>
                <Input
                  {...registerPassword('password')}
                  type="password"
                  placeholder="Enter your password"
                  error={errorsPassword.password?.message}
                />
              </div>

              <Button type="submit" className="w-full" loading={loading} size="lg">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 'setup' && setupData && (
        <div className="space-y-6">
          {/* Step 1: QR Code */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Step 1: Scan QR Code</CardTitle>
              <CardDescription>Use an authenticator app to scan this code</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 flex flex-col items-center gap-4">
                <img
                  src={setupData.qrCodeUrl}
                  alt="2FA QR Code"
                  className="w-48 h-48 border-2 border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-600 text-center">
                  Scan this code with Google Authenticator, Microsoft Authenticator, Authy, or any compatible app
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Can't scan? Enter this key manually:
                </p>
                <div className="bg-gray-100 rounded p-3 font-mono text-sm break-all">
                  {setupData.secret}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Backup Codes */}
          <Card className="shadow-lg border-amber-200 bg-amber-50">
            <CardHeader className="bg-amber-100/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <CardTitle className="text-amber-900">Step 2: Save Backup Codes</CardTitle>
                  <CardDescription className="text-amber-800">
                    Save these codes in a secure location
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-800 mb-4">
                These backup codes can be used to access your account if you lose access to your authenticator app. Each code can only be used once.
              </p>

              <div className="bg-white border border-amber-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setupData.backupCodes.map((code, index) => (
                    <div key={index} className="text-gray-700">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={copyBackupCodes}
                  className="flex-1"
                  size="sm"
                >
                  {copiedBackupCodes ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Codes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Verify */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Step 3: Verify Setup</CardTitle>
              <CardDescription>Enter the code from your authenticator app</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="error" className="mb-4" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmitVerify(onSubmitVerify)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter 6-digit code from your app
                  </label>
                  <Input
                    {...registerVerify('code')}
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    className="text-center text-2xl tracking-widest font-mono"
                    error={errorsVerify.code?.message}
                    autoComplete="off"
                  />
                </div>

                <Button type="submit" className="w-full" loading={loading} size="lg">
                  Verify and Enable 2FA
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {success && (
        <Card className="shadow-lg border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <Alert variant="success">{success}</Alert>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Redirecting to settings...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
