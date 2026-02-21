import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { organizationService } from '../services/organizationService';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { UserDetailModal } from '../components/ui/UserDetailModal';
import {
    Users,
    UserPlus,
    Search,
    Trash2,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    List,
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
    const [filterActive, setFilterActive] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [removing, setRemoving] = useState(false);

    const canDeleteMember = selectedOrganization && user && (
        user.id === selectedOrganization.ownerId ||
        user.role === 'SuperAdmin' ||
        user.roles?.includes('SuperAdmin')
    );

    // Reset search + reload when org changes
    useEffect(() => {
        setSearchTerm('');
        setFilterActive(null);
    }, [selectedOrganization?.id]);

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
            .getMembers(selectedOrganization.id, { isActive: filterActive, searchTerm })
            .then(data => setMembers(data.members || []))
            .catch(err => setError(err.response?.data?.message || 'Search failed'))
            .finally(() => setLoading(false));
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member from the organization?')) return;
        try {
            setRemoving(true);
            setError('');
            await organizationService.removeMember(selectedOrganization.id, userId);
            setSuccess('Member removed successfully');
            setSelectedUserId(null);
            await loadMembers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setRemoving(false);
        }
    };

    const filteredMembers = members.filter(member => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            member.userName?.toLowerCase().includes(s) ||
            member.email?.toLowerCase().includes(s) ||
            member.position?.toLowerCase().includes(s)
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
                        onClick={() => navigate(`/users/invite?orgId=${selectedOrganization?.id}`)}
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
                {error && <Alert variant="error" onClose={() => setError('')}>{error}</Alert>}
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
                    {[
                        { label: 'Total Members', value: stats.totalMembers, icon: Users, color: 'indigo', hover: 'hover:border-indigo-500/50' },
                        { label: 'Active', value: stats.activeMembers, icon: CheckCircle2, color: 'green', hover: 'hover:border-green-500/50' },
                        { label: 'Inactive', value: stats.totalMembers - stats.activeMembers, icon: XCircle, color: 'gray', hover: 'hover:border-gray-500/50' },
                    ].map(({ label, value, icon: Icon, color, hover }) => (
                        <div key={label} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 ${hover} transition-colors group`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                                    <p className={`text-4xl font-extrabold text-gray-900 dark:text-white mt-2 group-hover:text-${color}-600 dark:group-hover:text-${color}-400 transition-colors`}>{value}</p>
                                </div>
                                <div className={`p-3 bg-${color}-50 dark:bg-${color}-900/30 rounded-xl text-${color}-600 dark:text-${color}-400`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                        {/* Search */}
                        <div className="relative group w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or position…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Status filter */}
                            <div className="flex gap-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                                {[['All', null], ['Active', true], ['Inactive', false]].map(([label, val]) => (
                                    <button
                                        key={label}
                                        onClick={() => setFilterActive(val)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterActive === val
                                            ? val === true ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 shadow-sm'
                                              : val === false ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm'
                                              : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* View toggle */}
                            <div className="flex gap-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
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
                                    {searchTerm ? 'Try adjusting your search criteria.' : 'Invite your first team member to get started.'}
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* ── Grid View ── */
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredMembers.map(member => (
                                    <button
                                        key={member.userId}
                                        onClick={() => setSelectedUserId(member.userId)}
                                        className={`text-left bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group ${!member.isActive ? 'opacity-60' : ''}`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <ProfilePicture
                                                src={member.profileImageUrl}
                                                alt={member.userName}
                                                size="md"
                                                className="ring-2 ring-white dark:ring-gray-800 shadow-sm flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {member.userName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.position || 'Member'}</p>
                                            </div>
                                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${member.isActive
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                {member.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{member.email}</span></div>
                                            {member.phoneNumber && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 flex-shrink-0" />{member.phoneNumber}</div>}
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                                {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            /* ── List View ── */
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                                            {canDeleteMember && <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {filteredMembers.map(member => (
                                            <tr
                                                key={member.userId}
                                                onClick={() => setSelectedUserId(member.userId)}
                                                className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <ProfilePicture src={member.profileImageUrl} alt={member.userName} size="sm" className="ring-2 ring-white dark:ring-gray-800" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">{member.userName}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{member.position || 'Member'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm text-gray-600 dark:text-gray-300">{member.email}</div>
                                                    {member.phoneNumber && <div className="text-xs text-gray-400 mt-0.5">{member.phoneNumber}</div>}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${member.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                                                        {member.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                {canDeleteMember && (
                                                    <td className="py-4 px-4 text-right">
                                                        <button
                                                            onClick={e => { e.stopPropagation(); handleRemoveMember(member.userId); }}
                                                            disabled={removing}
                                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                            title="Remove Member"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                    {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* User Detail Modal */}
            {selectedUserId && (
                <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}
        </div>
    );
};
