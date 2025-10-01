import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { organizationService } from '../services/organizationService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import {
    Users,
    UserPlus,
    Search,
    Trash2,
    Mail,
    Phone,
    Calendar,
    X,
    Eye,
    Shield,
    CheckCircle2,
    XCircle,
    Filter,
    MoreVertical,
    BadgeCheck
} from 'lucide-react';
import { ProfilePicture } from '../components/ui/ProfilePicture';

export const MemberManagement = () => {
    const { selectedOrganization } = useOrganizations();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState(null); // null = all, true = active, false = inactive
    const [selectedMember, setSelectedMember] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [removing, setRemoving] = useState(false);

    // Permission check: Allow owner or super admin to delete members
    const canDeleteMember = selectedOrganization && user && (
        user.id === selectedOrganization.ownerId ||
        user.role === 'SuperAdmin' ||
        user.roles?.includes('SuperAdmin')
    );

    useEffect(() => {
        if (selectedOrganization) {
            loadMembers();
        }
    }, [selectedOrganization, filterActive]);

    const loadMembers = async () => {
        if (!selectedOrganization) return;

        try {
            setLoading(true);
            setError('');
            const data = await organizationService.getMembers(selectedOrganization.id, {
                isActive: filterActive,
            });
            setMembers(data.members || []);
            setStats({
                totalMembers: data.totalMembers || 0,
                activeMembers: data.activeMembers || 0,
            });
        } catch (err) {
            console.error('Failed to load members:', err);
            setError(err.response?.data?.message || 'Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!selectedOrganization) return;

        setLoading(true);
        organizationService
            .getMembers(selectedOrganization.id, {
                isActive: filterActive,
                searchTerm: searchTerm,
            })
            .then((data) => {
                setMembers(data.members || []);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Search failed');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member from the organization?')) return;

        try {
            setRemoving(true);
            setError('');
            await organizationService.removeMember(selectedOrganization.id, userId);
            setSuccess('Member removed successfully');
            await loadMembers();
            setShowDetailsModal(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setRemoving(false);
        }
    };

    const handleInviteMember = () => {
        navigate(`/users/invite?orgId=${selectedOrganization?.id}`);
    };

    const handleViewDetails = (member) => {
        navigate(`/members/${member.userId}`);
    };

    const filteredMembers = members.filter((member) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            member.userName?.toLowerCase().includes(search) ||
            member.email?.toLowerCase().includes(search) ||
            member.position?.toLowerCase().includes(search)
        );
    });

    if (!selectedOrganization) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md mx-4">
                    <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Organization Selected</h2>
                    <p className="text-gray-500 dark:text-gray-400">Please select an organization from the sidebar to manage your team.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent flex items-center gap-3">
                            Team Members
                            <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 align-middle">
                                {selectedOrganization.name}
                            </span>
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Manage access and roles for your organization members.
                        </p>
                    </div>
                    <Button
                        onClick={handleInviteMember}
                        size="lg"
                        className="group relative overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                        <span className="relative z-10 flex items-center font-semibold">
                            <UserPlus className="h-5 w-5 mr-2" />
                            Invite Member
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                    </Button>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert variant="success" onClose={() => setSuccess('')}>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            {success}
                        </div>
                    </Alert>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 hover:border-indigo-500/50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Members</p>
                                <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {stats.totalMembers}
                                </p>
                            </div>
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 hover:border-green-500/50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active</p>
                                <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    {stats.activeMembers}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 hover:border-gray-500/50 transition-colors group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inactive</p>
                                <p className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">
                                    {stats.totalMembers - stats.activeMembers}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400">
                                <XCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="relative group w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or position..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div className="flex gap-2 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                            <button
                                onClick={() => setFilterActive(null)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterActive === null
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterActive(true)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterActive === true
                                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterActive(false)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterActive === false
                                    ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
                            </div>
                        ) : filteredMembers.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="mx-auto w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                                    <Users className="h-10 w-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No members found</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchTerm
                                        ? 'Try adjusting your search criteria.'
                                        : 'Invite your first team member to get started.'}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role & Status</th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                                        <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredMembers.map((member) => (
                                        <tr
                                            key={member.userId}
                                            className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <ProfilePicture
                                                        src={member.profileImageUrl}
                                                        alt={member.userName}
                                                        size="md"
                                                        className="ring-2 ring-white dark:ring-gray-800 shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {member.userName}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {member.position || 'Member'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                        <Mail className="h-3 w-3 text-gray-400" />
                                                        {member.email}
                                                    </div>
                                                    {member.phoneNumber && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                            <Phone className="h-3 w-3 text-gray-400" />
                                                            {member.phoneNumber}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col items-start gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${member.isActive
                                                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50'
                                                        : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                                        }`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                        {member.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(member.joinedAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(member)}
                                                        className="hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 border-gray-200 dark:border-gray-700"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {canDeleteMember && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveMember(member.userId)}
                                                            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 border-gray-200 dark:border-gray-700 text-gray-400"
                                                            disabled={removing}
                                                            title="Remove Member"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Details Modal */}
            {showDetailsModal && selectedMember && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-blob">
                        <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-8 pb-8 relative">
                            <div className="flex justify-between items-end -mt-12 mb-6">
                                <ProfilePicture
                                    src={selectedMember.profileImageUrl}
                                    alt={selectedMember.userName}
                                    size="xl"
                                    className="ring-4 ring-white dark:ring-gray-800 shadow-xl"
                                />
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedMember.isActive
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                                    }`}>
                                    {selectedMember.isActive ? 'ACTIVE ACCOUNT' : 'INACTIVE'}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMember.userName}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{selectedMember.email}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</p>
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck className="h-5 w-5 text-indigo-500" />
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedMember.position || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-indigo-500" />
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedMember.joinedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-indigo-500" />
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedMember.phoneNumber || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => setShowDetailsModal(false)}
                                >
                                    Close
                                </Button>
                                {canDeleteMember && (
                                    <Button
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red500/20"
                                        onClick={() => handleRemoveMember(selectedMember.userId)}
                                        disabled={removing}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {removing ? 'Removing...' : 'Remove Member'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
