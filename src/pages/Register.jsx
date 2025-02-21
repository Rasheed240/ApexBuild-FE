import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Building2, Mail, Lock, User, Phone, CheckCircle2, XCircle, Calendar, MapPin, FileText, ArrowRight, Shield, ChevronDown, ChevronUp } from 'lucide-react';

// Password validation regex patterns matching backend requirements
const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  special: /[@$!%*?&#]/,
};

const registerSchema = z
  .object({
    // Basic Info
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters'),
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must not exceed 100 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must not exceed 100 characters')
      .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    middleName: z
      .string()
      .max(100, 'Middle name must not exceed 100 characters')
      .regex(/^[a-zA-Z\s'-]*$/, 'Middle name contains invalid characters')
      .optional()
      .or(z.literal('')),
    // Password
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must not exceed 100 characters')
      .refine((val) => passwordRegex.uppercase.test(val), {
        message: 'Password must contain at least one uppercase letter',
      })
      .refine((val) => passwordRegex.lowercase.test(val), {
        message: 'Password must contain at least one lowercase letter',
      })
      .refine((val) => passwordRegex.digit.test(val), {
        message: 'Password must contain at least one digit',
      })
      .refine((val) => passwordRegex.special.test(val), {
        message: 'Password must contain at least one special character (@$!%*?&#)',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    // Contact Info
    phoneNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$|^$/, 'Invalid phone number format (use international format, e.g., +1234567890)')
      .optional()
      .or(z.literal('')),
    // Personal Info
    dateOfBirth: z
      .string()
      .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), 'Invalid date format')
      .optional()
      .or(z.literal('')),
    gender: z
      .enum(['Male', 'Female', 'Other', 'PreferNotToSay'], {
        errorMap: () => ({ message: 'Please select a valid gender' }),
      })
      .optional(),
    // Address Info
    address: z
      .string()
      .max(500, 'Address must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    city: z
      .string()
      .max(100, 'City must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    state: z
      .string()
      .max(100, 'State must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    country: z
      .string()
      .max(100, 'Country must not exceed 100 characters')
      .optional()
      .or(z.literal('')),
    // Bio
    bio: z
      .string()
      .max(500, 'Bio must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    // Organization fields (REQUIRED)
    organizationName: z
      .string()
      .min(1, 'Organization name is required')
      .max(200, 'Organization name must not exceed 200 characters'),
    organizationDescription: z
      .string()
      .max(1000, 'Organization description must not exceed 1000 characters')
      .optional()
      .or(z.literal('')),
    organizationCode: z
      .string()
      .regex(/^[A-Z0-9-]*$/, 'Organization code must contain only uppercase letters, numbers, and hyphens')
      .max(50, 'Organization code must not exceed 50 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const PasswordRequirement = ({ met, children }) => (
  <div className={`flex items-center gap-2 text-sm ${met ? 'text-emerald-400' : 'text-gray-500'}`}>
    {met ? (
      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
    ) : (
      <XCircle className="h-4 w-4 flex-shrink-0" />
    )}
    <span>{children}</span>
  </div>
);

export const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: 'Other',
    },
  });

  const password = watch('password', '');

  // Check password requirements in real-time
  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        length: password.length >= 8,
        uppercase: passwordRegex.uppercase.test(password),
        lowercase: passwordRegex.lowercase.test(password),
        digit: passwordRegex.digit.test(password),
        special: passwordRegex.special.test(password),
      });
    } else {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        digit: false,
        special: false,
      });
    }
  }, [password]);

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;

      // Clean up empty optional fields
      Object.keys(registerData).forEach((key) => {
        if (registerData[key] === '' || registerData[key] === null) {
          registerData[key] = undefined;
        }
      });

      const response = await authService.register(registerData);
      setSuccess(response.message || 'Registration successful! Please check your email to confirm your account.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Registration failed. Please check your input and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="animate-fade-in shadow-2xl border border-gray-800/50 bg-gray-900/80 backdrop-blur-xl text-white w-full max-w-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 pointer-events-none" />

        <CardHeader className="text-center pb-6 pt-8 flex-shrink-0 bg-gradient-to-b from-gray-900/50 to-transparent backdrop-blur relative">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Building2 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-primary-100 to-blue-200 bg-clip-text text-transparent mb-2">
            Join ApexBuild
          </CardTitle>
          <CardDescription className="text-gray-400 text-base">
            Create your account and start managing projects
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6 overflow-y-auto flex-1 px-8">
          {error && (
            <Alert variant="error" className="mb-6 border-red-500/30 bg-red-500/10 backdrop-blur-sm" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-6 border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Essential Fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
                <User className="h-4 w-4 text-primary-400" />
                <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider">Personal Information</h3>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1.5 block">First Name *</label>
                  <Input
                    {...register('firstName')}
                    type="text"
                    placeholder="First name"
                    className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                    error={errors.firstName?.message}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Last Name *</label>
                  <Input
                    {...register('lastName')}
                    type="text"
                    placeholder="Last name"
                    className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              {/* Middle Name */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Middle Name <span className="text-gray-500 font-normal">(Optional)</span></label>
                <Input
                  {...register('middleName')}
                  type="text"
                  placeholder="Middle name"
                  className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                  error={errors.middleName?.message}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary-400" />
                  Email Address *
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="name@example.com"
                  className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                  error={errors.email?.message}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary-400" />
                  Password *
                </label>
                <Input
                  {...register('password')}
                  showPasswordToggle
                  placeholder="Create a strong password"
                  className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                  error={errors.password?.message}
                />
                {password && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-1.5 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary-400" />
                      Password Strength:
                    </p>
                    <PasswordRequirement met={passwordRequirements.length}>
                      At least 8 characters
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.uppercase}>
                      One uppercase letter
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.lowercase}>
                      One lowercase letter
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.digit}>
                      One digit
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordRequirements.special}>
                      One special character (@$!%*?&#)
                    </PasswordRequirement>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-primary-400" />
                  Confirm Password *
                </label>
                <Input
                  {...register('confirmPassword')}
                  showPasswordToggle
                  placeholder="Re-enter your password"
                  className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>

            {/* Organization Information */}
            <div className="space-y-4 border-t border-gray-700/50 pt-5 mt-1">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
                <Building2 className="h-4 w-4 text-primary-400" />
                <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider">Organization Details</h3>
              </div>
              <p className="text-xs text-gray-400 bg-blue-500/5 border border-blue-500/20 rounded-lg p-2.5">
                Every user must belong to an organization. Create your organization now.
              </p>

              {/* Organization Name */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Organization Name *</label>
                <Input
                  {...register('organizationName')}
                  type="text"
                  placeholder="Your Company or Organization Name"
                  className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                  error={errors.organizationName?.message}
                />
              </div>

              {/* Organization Description */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Organization Description <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  {...register('organizationDescription')}
                  placeholder="Brief description of your organization"
                  className="px-3 py-2 w-full h-20 bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm resize-none hover:bg-gray-800/70 transition-all"
                />
                {errors.organizationDescription?.message && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.organizationDescription.message}</p>
                )}
              </div>

              {/* Organization Code */}
              <div>
                <label className="text-xs font-semibold text-gray-300 mb-1.5 block">
                  Organization Code <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <Input
                  {...register('organizationCode')}
                  type="text"
                  placeholder="ORG-2025-001"
                  className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm uppercase rounded-lg hover:bg-gray-800/70 transition-all"
                  error={errors.organizationCode?.message}
                />
                <p className="text-xs text-gray-500 mt-1.5">Auto-generated if not provided</p>
              </div>
            </div>

            {/* Expandable Additional Information */}
            <div className="border-t border-gray-700/50 pt-5 mt-1">
              <button
                type="button"
                onClick={() => setShowAllFields(!showAllFields)}
                className="w-full text-sm font-semibold text-primary-400 hover:text-primary-300 transition-all flex items-center justify-between gap-2 mb-4 p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg border border-gray-700/50 group"
              >
                <span className="flex items-center gap-2">
                  {showAllFields ? (
                    <ChevronUp className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform" />
                  ) : (
                    <ChevronDown className="h-4 w-4 group-hover:translate-y-[2px] transition-transform" />
                  )}
                  {showAllFields ? 'Hide' : 'Add'} Additional Information
                </span>
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </button>

              {showAllFields && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary-400" />
                      Phone Number
                    </label>
                    <Input
                      {...register('phoneNumber')}
                      type="tel"
                      placeholder="+1234567890"
                      className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                      error={errors.phoneNumber?.message}
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary-400" />
                      Date of Birth
                    </label>
                    <Input
                      {...register('dateOfBirth')}
                      type="date"
                      className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                      error={errors.dateOfBirth?.message}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Gender</label>
                    <select
                      {...register('gender')}
                      className="w-full h-10 bg-gray-800/50 border border-gray-700/50 text-white rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm hover:bg-gray-800/70 transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="PreferNotToSay">Prefer not to say</option>
                    </select>
                    {errors.gender?.message && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary-400" />
                      Address
                    </label>
                    <Input
                      {...register('address')}
                      type="text"
                      placeholder="Street address"
                      className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                      error={errors.address?.message}
                    />
                  </div>

                  {/* City, State, Country */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-300 mb-1.5 block">City</label>
                      <Input
                        {...register('city')}
                        type="text"
                        placeholder="City"
                        className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                        error={errors.city?.message}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-300 mb-1.5 block">State</label>
                      <Input
                        {...register('state')}
                        type="text"
                        placeholder="State"
                        className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                        error={errors.state?.message}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-300 mb-1.5 block">Country</label>
                      <Input
                        {...register('country')}
                        type="text"
                        placeholder="Country"
                        className="h-10 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm rounded-lg hover:bg-gray-800/70 transition-all"
                        error={errors.country?.message}
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-xs font-semibold text-gray-300 mb-1.5 block flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary-400" />
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      placeholder="Tell us about yourself (max 500 characters)"
                      className="px-3 py-2 w-full h-20 bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-500 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm resize-none hover:bg-gray-800/70 transition-all"
                    />
                    {errors.bio?.message && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.bio.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 hover:from-primary-700 hover:via-primary-600 hover:to-blue-700 shadow-lg hover:shadow-primary-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-base rounded-xl mt-6 group"
              loading={loading}
            >
              {!loading && (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs pt-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Your data is encrypted and secure</span>
            </div>

            {/* Sign In Link */}
            <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700/50">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-bold transition-colors duration-200 hover:underline inline-flex items-center gap-1 group"
              >
                Sign in
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
