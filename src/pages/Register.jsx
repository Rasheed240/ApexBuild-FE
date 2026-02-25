import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import {
  Building2, Mail, Lock, User, Phone, ArrowRight, Shield,
  Eye, EyeOff, Check, X, ChevronDown, ChevronUp, CheckCircle2, Sun, Moon,
} from 'lucide-react';

const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  special: /[@$!%*?&#]/,
};

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email').max(255),
  firstName: z.string().min(1, 'First name is required').max(100).regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters'),
  lastName: z.string().min(1, 'Last name is required').max(100).regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters'),
  middleName: z.string().max(100).regex(/^[a-zA-Z\s'-]*$/, 'Invalid characters').optional().or(z.literal('')),
  password: z.string().min(1, 'Password is required').min(8, 'Min 8 characters').max(100)
    .refine(v => passwordRegex.uppercase.test(v), 'Needs uppercase letter')
    .refine(v => passwordRegex.lowercase.test(v), 'Needs lowercase letter')
    .refine(v => passwordRegex.digit.test(v), 'Needs a number')
    .refine(v => passwordRegex.special.test(v), 'Needs a special character (@$!%*?&#)'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$|^$/, 'Use international format e.g. +2348...').optional().or(z.literal('')),
  dateOfBirth: z.string().refine(v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Invalid date').optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other', 'PreferNotToSay'], { errorMap: () => ({ message: 'Select a gender' }) }).optional(),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  organizationName: z.string().min(1, 'Organization name is required').max(200),
  organizationDescription: z.string().max(1000).optional().or(z.literal('')),
  organizationCode: z.string().regex(/^[A-Z0-9-]*$/, 'Uppercase, numbers and hyphens only').max(50).optional().or(z.literal('')),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const PwReq = ({ met, label }) => (
  <span className={`flex items-center gap-1 text-xs font-medium transition-colors ${met ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-600'}`}>
    {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    {label}
  </span>
);

const Field = ({ label, required, error, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
      {label}{required && <span className="text-primary-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1 font-medium">{error}</p>}
  </div>
);

const inputCls = (hasError) =>
  `w-full px-3.5 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200
   bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600
   ${hasError
    ? 'border-2 border-red-500/50 focus:border-red-500'
    : 'border border-gray-200 dark:border-slate-700/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-gray-300 dark:hover:border-slate-600'
  }`;

const iconInputCls = (hasError) =>
  `w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200
   bg-gray-100 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600
   ${hasError
    ? 'border-2 border-red-500/50 focus:border-red-500'
    : 'border border-gray-200 dark:border-slate-700/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 hover:border-gray-300 dark:hover:border-slate-600'
  }`;

export const Register = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwReqs, setPwReqs] = useState({ length: false, upper: false, lower: false, digit: false, special: false });

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: 'Other' },
  });

  const password = watch('password', '');
  useEffect(() => {
    setPwReqs({
      length: password.length >= 8,
      upper: passwordRegex.uppercase.test(password),
      lower: passwordRegex.lowercase.test(password),
      digit: passwordRegex.digit.test(password),
      special: passwordRegex.special.test(password),
    });
  }, [password]);

  const onSubmit = async (data) => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      Object.keys(payload).forEach(k => { if (payload[k] === '' || payload[k] == null) delete payload[k]; });
      const response = await authService.register(payload);
      setSuccess(response.message || 'Registration successful! Please check your email to verify your account.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Account created!</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{success}</p>
          <p className="text-xs text-gray-400 dark:text-slate-600">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-slate-950">
      {/* ── Left brand strip ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[340px] xl:w-[380px] relative overflow-hidden flex-col p-10 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-950" />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.12) 0%, transparent 60%)' }} />

        {/* Logo */}
        <div className="relative z-10 mb-10">
          <picture>
            <source srcSet="/apexbuild-image.webp" type="image/webp" />
            <img src="/apexbuild-image.png" alt="ApexBuild" className="w-52 object-contain" loading="eager" fetchPriority="high" />
          </picture>
        </div>

        {/* Hero + checklist */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Start building<br />
              <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">smarter today.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Set up your organization and get your entire project team connected in minutes.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Free 14-day trial, no credit card required',
              'Unlimited projects during trial',
              'Invite your full team immediately',
              'Enterprise security from day one',
            ].map(item => (
              <div key={item} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 bg-primary-500/15 border border-primary-500/25 rounded-full flex items-center justify-center mt-0.5">
                  <Check className="h-3 w-3 text-primary-400" />
                </div>
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10 mt-auto pt-8">
          <div className="p-4 bg-slate-800/40 border border-slate-700/40 rounded-xl">
            <p className="text-xs text-slate-400 italic leading-relaxed">
              "ApexBuild transformed how we coordinate 200+ workers across 12 simultaneous sites."
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-2">— Rasheed Babatunde, Managing Director</p>
          </div>
        </div>
      </div>

      {/* ── Mobile brand header (hidden on desktop) ────────────────── */}
      <div className="lg:hidden relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-950" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 20% 40%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />

        {/* Theme toggle inside mobile header */}
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 hover:text-white transition-all"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-10 pb-7">
          <picture>
            <source srcSet="/apexbuild-image.webp" type="image/webp" />
            <img src="/apexbuild-image.png" alt="ApexBuild" className="h-20 object-contain mb-4" loading="eager" fetchPriority="high" />
          </picture>
          <h2 className="text-2xl font-black text-white leading-tight mb-1">
            Start building{' '}
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">smarter today.</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-xs">
            Set up your organization and get your entire team connected in minutes.
          </p>
          {/* Perks pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Free 14-day trial', 'No credit card', 'Enterprise security'].map(item => (
              <span key={item} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-[10px] font-semibold">
                <Check className="h-2.5 w-2.5" />
                {item}
              </span>
            ))}
          </div>
          {/* Sign-in link */}
          <p className="text-xs text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Top bar – desktop only sign-in link & theme toggle */}
          <div className="hidden lg:flex items-center justify-between px-8 py-5 flex-shrink-0">
            <div />
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              Already have an account?
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold transition-colors">Sign in</Link>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800/60 hover:bg-gray-200 dark:hover:bg-slate-700/80 border border-gray-200 dark:border-slate-700/50 text-gray-500 dark:text-slate-300 hover:text-gray-700 dark:hover:text-white transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Form content */}
          <div className="flex-1 px-8 pb-10 max-w-2xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1.5">Create your account</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm">Set up your workspace in under 2 minutes</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <p className="text-sm text-red-400 font-medium leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* ── Section: Your Details ── */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-6 rounded-full bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-xs font-black text-primary-400">1</div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Your details</h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" required error={errors.firstName?.message}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '15px', height: '15px' }} />
                      <input {...register('firstName')} placeholder="James" className={iconInputCls(errors.firstName)} />
                    </div>
                  </Field>
                  <Field label="Last name" required error={errors.lastName?.message}>
                    <input {...register('lastName')} placeholder="Okafor" className={inputCls(errors.lastName)} />
                  </Field>

                  <Field label="Email address" required error={errors.email?.message} className="col-span-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '15px', height: '15px' }} />
                      <input {...register('email')} type="email" autoComplete="email" placeholder="james@company.com" className={iconInputCls(errors.email)} />
                    </div>
                  </Field>

                  <Field label="Password" required error={errors.password?.message} className="col-span-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '15px', height: '15px' }} />
                      <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars" className={`${iconInputCls(errors.password)} pr-11`} />
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                        <PwReq met={pwReqs.length} label="8+ chars" />
                        <PwReq met={pwReqs.upper} label="Uppercase" />
                        <PwReq met={pwReqs.lower} label="Lowercase" />
                        <PwReq met={pwReqs.digit} label="Number" />
                        <PwReq met={pwReqs.special} label="Special char" />
                      </div>
                    )}
                  </Field>

                  <Field label="Confirm password" required error={errors.confirmPassword?.message} className="col-span-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '15px', height: '15px' }} />
                      <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" className={`${iconInputCls(errors.confirmPassword)} pr-11`} />
                      <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                        {showConfirm ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                      </button>
                    </div>
                  </Field>
                </div>
              </div>

              {/* ── Section: Organization ── */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-6 h-6 rounded-full bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-xs font-black text-primary-400">2</div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Your organization</h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Organization name" required error={errors.organizationName?.message} className="col-span-2">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '15px', height: '15px' }} />
                      <input {...register('organizationName')} placeholder="Okafor Construction Ltd" className={iconInputCls(errors.organizationName)} />
                    </div>
                  </Field>
                  <Field label="Phone number" error={errors.phoneNumber?.message} className="col-span-2">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" style={{ width: '15px', height: '15px' }} />
                      <input {...register('phoneNumber')} type="tel" placeholder="+2348100000001" className={iconInputCls(errors.phoneNumber)} />
                    </div>
                  </Field>
                </div>
              </div>

              {/* ── Optional fields toggle ── */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowOptional(v => !v)}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 uppercase tracking-widest transition-colors group"
                >
                  {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showOptional ? 'Hide' : 'Add'} optional details
                  <span className="text-gray-300 dark:text-slate-700 normal-case font-normal tracking-normal">(profile, address, etc.)</span>
                </button>

                {showOptional && (
                  <div className="mt-5 grid grid-cols-2 gap-4 p-5 bg-gray-50 dark:bg-slate-800/20 border border-gray-200 dark:border-slate-800 rounded-xl">
                    <Field label="Middle name" error={errors.middleName?.message}>
                      <input {...register('middleName')} placeholder="Optional" className={inputCls(errors.middleName)} />
                    </Field>
                    <Field label="Date of birth" error={errors.dateOfBirth?.message}>
                      <input {...register('dateOfBirth')} type="date" className={inputCls(errors.dateOfBirth)} />
                    </Field>
                    <Field label="Gender" error={errors.gender?.message}>
                      <select {...register('gender')} className={`${inputCls(errors.gender)} appearance-none`}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="PreferNotToSay">Prefer not to say</option>
                      </select>
                    </Field>
                    <Field label="City" error={errors.city?.message}>
                      <input {...register('city')} placeholder="Lagos" className={inputCls(errors.city)} />
                    </Field>
                    <Field label="State / Region" error={errors.state?.message}>
                      <input {...register('state')} placeholder="Lagos State" className={inputCls(errors.state)} />
                    </Field>
                    <Field label="Country" error={errors.country?.message}>
                      <input {...register('country')} placeholder="Nigeria" className={inputCls(errors.country)} />
                    </Field>
                    <Field label="Address" error={errors.address?.message} className="col-span-2">
                      <input {...register('address')} placeholder="123 Construction Ave" className={inputCls(errors.address)} />
                    </Field>
                    <Field label="Bio" error={errors.bio?.message} className="col-span-2">
                      <textarea {...register('bio')} rows={2} placeholder="Brief description of your role and expertise..." className={`${inputCls(errors.bio)} resize-none`} />
                    </Field>
                    <Field label="Organization code" error={errors.organizationCode?.message}>
                      <input {...register('organizationCode')} placeholder="ORG-2025-001" className={inputCls(errors.organizationCode)} />
                    </Field>
                    <Field label="Organization description" error={errors.organizationDescription?.message} className="col-span-2">
                      <textarea {...register('organizationDescription')} rows={2} placeholder="What does your organization do?" className={`${inputCls(errors.organizationDescription)} resize-none`} />
                    </Field>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 active:from-primary-700 active:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      Create my account
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 dark:text-slate-700 mt-5 flex items-center justify-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  By creating an account you agree to our Terms of Service & Privacy Policy.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
