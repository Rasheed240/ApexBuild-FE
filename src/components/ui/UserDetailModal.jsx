import { useState, useEffect } from 'react';
import {
  X, Mail, Phone, MapPin, Calendar, User, Briefcase,
  Shield, Loader, Building2,
} from 'lucide-react';
import api from '../../services/api';
import { ProfilePicture } from './ProfilePicture';

const STATUS_COLORS = {
  Active:    'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  Inactive:  'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
  Suspended: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const ROLE_COLORS = {
  SuperAdmin:            'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  PlatformAdmin:         'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  ProjectOwner:          'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
  ProjectAdministrator:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
  ContractorAdmin:       'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  DepartmentSupervisor:  'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300',
  FieldWorker:           'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

export function UserDetailModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/users/${userId}`)
      .then(res => setProfile(res.data?.data || res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ');
  const dob = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Gradient header */}
        <div className="relative h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : !profile ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>Unable to load profile</p>
            </div>
          ) : (
            <div className="px-6 pb-6">
              {/* Avatar + name */}
              <div className="flex items-end justify-between -mt-12 mb-5">
                <ProfilePicture
                  src={profile.profileImageUrl}
                  alt={profile.fullName}
                  size="xl"
                  className="ring-4 ring-white dark:ring-gray-800 shadow-xl"
                />
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[profile.status] || STATUS_COLORS.Inactive}`}>
                  {profile.status?.toUpperCase()}
                </span>
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.fullName}</h2>
              {profile.gender && (
                <p className="text-sm text-gray-400 dark:text-gray-500 capitalize">{profile.gender}</p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  {profile.bio}
                </p>
              )}

              {/* Roles */}
              {profile.roles?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {profile.roles.map((r, i) => (
                    <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[r.roleType] || ROLE_COLORS.FieldWorker}`}>
                      {r.roleType}{r.projectName ? ` · ${r.projectName}` : r.organizationName ? ` · ${r.organizationName}` : ''}
                    </span>
                  ))}
                </div>
              )}

              {/* Info rows */}
              <div className="mt-5 space-y-3 border-t border-gray-100 dark:border-gray-700 pt-5">
                <InfoRow icon={Mail}      label="Email"       value={profile.email} />
                <InfoRow icon={Phone}     label="Phone"       value={profile.phoneNumber} />
                <InfoRow icon={MapPin}    label="Location"    value={location || undefined} />
                {profile.address && <InfoRow icon={Building2} label="Address" value={profile.address} />}
                <InfoRow icon={Calendar}  label="Date of Birth" value={dob} />
                <InfoRow icon={User}      label="Member Since"  value={joined} />
                <InfoRow icon={Shield}    label="2FA"           value={profile.twoFactorEnabled ? 'Enabled' : undefined} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
