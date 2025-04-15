import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  ChevronRight,
  Upload,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  Search,
  Loader
} from 'lucide-react';
import api from '../services/api';
import { uploadOrganizationLogo } from '../services/mediaService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProfilePicture } from '../components/ui/ProfilePicture';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';

export function OrganizationDetail() {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizationDetails();
  }, [organizationId, showActiveOnly]);

  const fetchOrganizationDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch organization
      const orgRes = await api.get(`/organizations/${organizationId}`);
      const orgData = orgRes.data?.data || orgRes.data;
      setOrganization(orgData);

      // Fetch members
      const membersRes = await api.get(`/organizations/${organizationId}/members`, {
        params: {
          isActive: showActiveOnly || undefined,
        },
      });
      const membersData = membersRes.data?.data || membersRes.data;
      setMembers(membersData.members || []);
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError(err.response?.data?.message || 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    try {
      setUploadingLogo(true);
      const result = await uploadOrganizationLogo(organizationId, file);

      // Update organization with new logo
      setOrganization(prev => ({
        ...prev,
        logoUrl: result.url,
      }));

      return result;
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err.message || 'Failed to upload logo');
      throw err;
    } finally {
      setUploadingLogo(false);
    }
  };

  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      member.userName?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.position?.toLowerCase().includes(search)
    );
  });

  const isOwner = organization && user && organization.ownerId === user.id;
  const canEdit = isOwner; // Add more permission checks here if needed

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading organization..." />
      </div>
    );
  }

  if (error && !organization) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <XCircle className="h-16 w-16 mx-auto mb-6 text-red-500 dark:text-red-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Error Loading Organization
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
              <Button onClick={() => navigate('/organizations')}>
                View All Organizations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/organizations" className="hover:text-primary-600">Organizations</Link>
          <ChevronRight className="h-4 w-4" />
          <span>{organization?.name}</span>
        </div>

        {/* Organization Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {canEdit ? (
                  <div className="relative">
                    <div className="h-32 w-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                      {uploadingLogo ? (
                        <Loader className="h-12 w-12 text-white animate-spin" />
                      ) : organization?.logoUrl ? (
                        <img
                          src={organization.logoUrl}
                          alt={organization.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="h-12 w-12 text-white" />
                      )}
                    </div>
                    {!uploadingLogo && (
                      <label
                        htmlFor="logo-upload"
                        className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="h-32 w-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                    {organization?.logoUrl ? (
                      <img
                        src={organization.logoUrl}
                        alt={organization.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-12 w-12 text-white" />
                    )}
                  </div>
                )}
              </div>

              {/* Organization Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {organization?.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {organization?.code}
                    </p>
                  </div>
                  {isOwner && (
                    <Badge variant="primary" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  )}
                </div>

                {organization?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {organization.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organization?.email && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${organization.email}`} className="hover:text-primary-600">
                        {organization.email}
                      </a>
                    </div>
                  )}

                  {organization?.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${organization.phoneNumber}`} className="hover:text-primary-600">
                        {organization.phoneNumber}
                      </a>
                    </div>
                  )}

                  {organization?.website && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600"
                      >
                        {organization.website}
                      </a>
                    </div>
                  )}

                  {organization?.address && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {organization.address}
                        {organization.city && `, ${organization.city}`}
                        {organization.state && `, ${organization.state}`}
                        {organization.country && `, ${organization.country}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({filteredMembers.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md"
                  onClick={() => navigate(`/users/invite?orgId=${organizationId}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-2 px-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Active only
                  </label>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No members found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Profile Picture */}
                    <ProfilePicture
                      src={member.profileImageUrl}
                      alt={member.userName}
                      size="lg"
                    />

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {member.userName}
                        </h3>
                        {member.isOwner && (
                          <Badge variant="primary" className="gap-1">
                            <Crown className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                        {member.isActive ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {member.email}
                      </p>

                      {member.position && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                          {member.position}
                        </p>
                      )}

                      {/* Roles */}
                      {member.roles && member.roles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {member.roles.map((role, index) => (
                            <Badge key={index} variant="outline" className="gap-1">
                              <Shield className="h-3 w-3" />
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {member.phoneNumber && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          <Phone className="h-3 w-3 inline mr-1" />
                          {member.phoneNumber}
                        </p>
                      )}
                    </div>

                    {/* Member Since */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Member since
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {new Date(member.joinedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
