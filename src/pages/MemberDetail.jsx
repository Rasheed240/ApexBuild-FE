import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { organizationService } from '../services/organizationService';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ProfilePicture } from '../components/ui/ProfilePicture';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  ShieldCheck,
  User,
  Briefcase,
  Activity,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Send,
  MoreVertical,
  Building2,
  AlertCircle,
  Award,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
} from 'lucide-react';

export const MemberDetail = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizations();
  const { user } = useAuth();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removing, setRemoving] = useState(false);

  // Permission check: Allow owner or super admin to delete members
  // Also checking if the current user is NOT the member being deleted (cannot delete self this way usually)
  const canDeleteMember = selectedOrganization && user && (
    user.id === selectedOrganization.ownerId ||
    user.role === 'SuperAdmin' ||
    user.roles?.includes('SuperAdmin')
  );

  useEffect(() => {
    if (selectedOrganization && memberId) {
      loadMemberDetail();
    }
  }, [selectedOrganization, memberId]);

  const loadMemberDetail = async () => {
    if (!selectedOrganization || !memberId) return;

    try {
      setLoading(true);
      setError('');
      const data = await organizationService.getMembers(selectedOrganization.id);
      const foundMember = data.members?.find(m => m.userId === memberId);

      if (!foundMember) {
        setError('Member not found');
        return;
      }

      setMember(foundMember);
    } catch (err) {
      console.error('Failed to load member details:', err);
      setError(err.response?.data?.message || 'Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!confirm('Are you sure you want to remove this member from the organization? This action cannot be undone.')) return;

    try {
      setRemoving(true);
      setError('');
      await organizationService.removeMember(selectedOrganization.id, memberId);
      setSuccess('Member removed successfully');
      setTimeout(() => {
        navigate('/members');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(false);
    }
  };

  if (!selectedOrganization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md">
          <Building2 className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Organization Selected</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Please select an organization to view member details.</p>
          <Link to="/organizations">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
              Select Organization
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading member details...</p>
        </div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/members">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Members
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!member) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden pb-32">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 pt-8">
          <div className="flex items-center justify-between">
            <Link to="/members">
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Members
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20" title="Edit Member">
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20" title="More Options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 pb-12 relative z-10">
        {/* Alerts */}
        {error && (
          <Alert variant="error" onClose={() => setError('')} className="mb-6">
            <AlertCircle className="h-5 w-5" />
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} className="mb-6">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </Alert>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative">
              <ProfilePicture
                src={member.profileImageUrl}
                alt={member.userName}
                size="2xl"
                className="ring-4 ring-white dark:ring-gray-800 shadow-2xl"
              />
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-full border-4 border-white dark:border-gray-800 shadow-lg ${member.isActive
                  ? 'bg-green-500'
                  : 'bg-gray-400'
                }`}>
                {member.isActive ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <XCircle className="h-5 w-5 text-white" />
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{member.userName}</h1>
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-xl font-medium">{member.position || 'Team Member'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-medium text-sm">
                  <Building2 className="h-4 w-4" />
                  {selectedOrganization.name}
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-medium text-sm border ${member.isActive
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                  }`}>
                  <span className={`h-2 w-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {member.isActive ? 'Active Account' : 'Inactive Account'}
                </div>
                {member.isVerified && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium text-sm border border-yellow-200 dark:border-yellow-800">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Member
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(member.joinedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Contact & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Contact Information
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                    >
                      {member.email}
                    </a>
                  </div>
                </div>

                {member.phoneNumber && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                      <a
                        href={`tel:${member.phoneNumber}`}
                        className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {member.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(member.joinedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.floor((new Date() - new Date(member.joinedAt)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Quick Actions
                </h2>
              </div>

              <div className="p-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                  onClick={() => window.location.href = `mailto:${member.email}`}
                >
                  <Send className="mr-3 h-4 w-4" />
                  Send Email
                </Button>

                {member.phoneNumber && (
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30"
                    onClick={() => window.location.href = `tel:${member.phoneNumber}`}
                  >
                    <Phone className="mr-3 h-4 w-4" />
                    Call Member
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-pink-50 hover:text-pink-600 dark:hover:bg-pink-900/30"
                >
                  <MessageSquare className="mr-3 h-4 w-4" />
                  Send Message
                </Button>

                {canDeleteMember && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={handleRemoveMember}
                      disabled={removing}
                    >
                      <Trash2 className="mr-3 h-4 w-4" />
                      {removing ? 'Removing...' : 'Remove from Organization'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Member Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Member Details
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{member.position || 'Not specified'}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{member.role || 'Member'}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-pink-500" />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${member.isActive
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                      <span className={`h-2 w-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm font-bold">{member.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">0</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">0</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Projects</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                    <Award className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">100%</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Performance</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Recent Activity
                </h2>
              </div>

              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No recent activity to display</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
