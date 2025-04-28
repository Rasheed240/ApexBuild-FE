import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { uploadProfilePicture } from '../services/mediaService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { ProfilePicture } from '../components/ui/ProfilePicture';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Globe,
  Camera,
  Save,
  Loader2,
  Briefcase
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  middleName: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
});

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      middleName: user?.middleName || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || '',
    },
  });

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const response = await authService.getCurrentUser();
        const fullUser = response.data;

        // Create a default values object to ensure all fields are touched
        const defaultValues = {
          firstName: fullUser.firstName || '',
          lastName: fullUser.lastName || '',
          middleName: fullUser.middleName || '',
          phoneNumber: fullUser.phoneNumber || '',
          bio: fullUser.bio || '',
          address: fullUser.address || '',
          city: fullUser.city || '',
          state: fullUser.state || '',
          country: fullUser.country || '',
          dateOfBirth: fullUser.dateOfBirth ? new Date(fullUser.dateOfBirth).toISOString().split('T')[0] : '',
          gender: fullUser.gender || '',
          profileImageUrl: fullUser.profileImageUrl || ''
        };

        reset(defaultValues);
        setProfileImage(fullUser.profileImageUrl || null);

        // Also update context with the full user data so other components have it
        // We compare JSON strings to avoid infinite loops if objects are identical
        if (JSON.stringify(user) !== JSON.stringify(fullUser)) {
          updateUser(fullUser);
        }

      } catch (err) {
        console.error('Failed to fetch full profile:', err);
        // Fallback to context user if API fails
        if (user) {
          const defaultValues = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            middleName: user.middleName || '',
            phoneNumber: user.phoneNumber || '',
            bio: user.bio || '',
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
            gender: user.gender || '',
            profileImageUrl: user.profileImageUrl || ''
          };
          reset(defaultValues);
          setProfileImage(user.profileImageUrl || null);
        }
      }
    };

    fetchFullProfile();
  }, [reset]); // Removed user dependence to prevent loop if we update context

  const handleProfilePictureUpload = async (file) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Upload to Cloudinary via backend
      const result = await uploadProfilePicture(file);

      // Update local state
      setProfileImage(result.url);

      // Update user context
      updateUser({
        ...user,
        profileImageUrl: result.url,
      });

      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err.response?.data?.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = Object.keys(data).reduce((acc, key) => {
        let value = data[key] === '' ? null : data[key];
        if (key === 'dateOfBirth' && value) {
          value = new Date(value).toISOString();
        }
        acc[key] = value;
        return acc;
      }, {});

      const response = await userService.updateProfile(payload);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header with Banner */}
      <div className="relative h-48 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 text-white bg-gradient-to-t from-black/60 to-transparent">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-white/80">Manage your account information and preferences</p>
        </div>
      </div>

      {success && (
        <Alert variant="success" className="border-green-300 bg-green-50" onClose={() => setSuccess('')}>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            {success}
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="border-red-300 bg-red-50" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-12 px-4 relative z-10">
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="px-6 pt-8 pb-6 text-center bg-white dark:bg-gray-800">
                <div className="flex justify-center mb-4">
                  <ProfilePicture
                    src={profileImage}
                    alt={user.fullName}
                    size="xl"
                    editable={true}
                    onUpload={handleProfilePictureUpload}
                    uploading={uploading}
                    className="ring-4 ring-white dark:ring-gray-800"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user.fullName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>

                {uploading && (
                  <div className="flex items-center justify-center gap-2 text-primary-600 mb-2">
                    <Spinner size="sm" />
                    <span className="text-xs">Uploading...</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-t border-gray-100 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Joined</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.joinedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || loading}
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              loading={loading}
              disabled={!isDirty}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary-500" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic identification details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  {...register('firstName')}
                  error={errors.firstName?.message}
                  leftIcon={User}
                />
                <Input
                  label="Last Name"
                  {...register('lastName')}
                  error={errors.lastName?.message}
                  leftIcon={User}
                />
                <Input
                  label="Middle Name"
                  {...register('middleName')}
                  error={errors.middleName?.message}
                  leftIcon={User}
                />
                <Input
                  label="Phone Number"
                  {...register('phoneNumber')}
                  error={errors.phoneNumber?.message}
                  leftIcon={Phone}
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Bio
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Tell us about yourself..."
                      {...register('bio')}
                    />
                  </div>
                  {errors.bio && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  Address & Location
                </CardTitle>
                <CardDescription>Your contact location details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Address"
                  {...register('address')}
                  error={errors.address?.message}
                  leftIcon={MapPin}
                  className="md:col-span-2"
                />
                <Input
                  label="City"
                  {...register('city')}
                  error={errors.city?.message}
                  leftIcon={Building}
                />
                <Input
                  label="State / Province"
                  {...register('state')}
                  error={errors.state?.message}
                  leftIcon={MapPin}
                />
                <Input
                  label="Country"
                  {...register('country')}
                  error={errors.country?.message}
                  leftIcon={Globe}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-primary-500" />
                  Other Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="date"
                  label="Date of Birth"
                  {...register('dateOfBirth')}
                  error={errors.dateOfBirth?.message}
                  leftIcon={Calendar}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Gender
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none"
                      {...register('gender')}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.gender.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};
