import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import {
  Building2,
  Users,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  Layers,
  Search,
  CheckCircle2,
  Eye,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  Award,
  AlertCircle,
  ChevronRight,
  Grid3x3,
  List,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const OrganizationsPage = ({ openForm = false }) => {
  const navigate = useNavigate();
  const {
    organizations,
    selectedOrganization,
    selectOrganization,
    createOrganization,
    refreshOrganizations,
    loading,
    error,
  } = useOrganizations();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });
  const [formMode, setFormMode] = useState('create');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'members' | 'recent'
  const [filterActive, setFilterActive] = useState(null); // null | true | false
  const [showFormPanel, setShowFormPanel] = useState(openForm);

  // Open form panel if openForm prop is true
  useEffect(() => {
    if (openForm) {
      setFormMode('create');
      setShowFormPanel(true);
    }
  }, [openForm]);

  // Advanced filtering and sorting
  const filteredAndSortedOrgs = useMemo(() => {
    let filtered = organizations.filter((org) => {
      const matchesSearch =
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterActive === null || org.isActive === filterActive;

      return matchesSearch && matchesStatus;
    });

    // Sort organizations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return (b.memberCount || 0) - (a.memberCount || 0);
        case 'recent':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    return filtered;
  }, [organizations, searchTerm, sortBy, filterActive]);

  const stats = useMemo(() => {
    return {
      total: organizations.length,
      active: organizations.filter(o => o.isActive).length,
      totalMembers: organizations.reduce((sum, o) => sum + (o.memberCount || 0), 0),
      verified: organizations.filter(o => o.isVerified).length,
    };
  }, [organizations]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' });
    setFormMode('create');
    setFormError('');
    setShowFormPanel(false);
    // Navigate back to /organizations if we came from /organizations/new
    if (window.location.pathname === '/organizations/new') {
      navigate('/organizations');
    }
  };

  const handleEdit = async (organization) => {
    setFormMode('edit');
    setFormData({
      id: organization.id,
      name: organization.name,
      code: organization.code,
      description: organization.description ?? '',
    });
    setShowFormPanel(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (organizationId) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;

    try {
      setSubmitting(true);
      const { organizationService } = await import('../services/organizationService');
      await organizationService.deleteOrganization(organizationId);
      setFormSuccess('Organization deleted successfully.');
      if (selectedOrganization?.id === organizationId) {
        selectOrganization(null);
      }
      await refreshOrganizations();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete organization.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setFormSuccess(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!formData.name?.trim()) {
      setFormError('Organization name is required.');
      return;
    }

    try {
      setSubmitting(true);
      if (formMode === 'create') {
        // Use the createOrganization method from context which handles refresh and auto-select
        await createOrganization({
          name: formData.name.trim(),
          code: formData.code?.trim(),
          description: formData.description?.trim(),
        });
        setFormSuccess('Organization created successfully! You are now the owner.');
      } else if (formMode === 'edit' && formData.id) {
        const { organizationService } = await import('../services/organizationService');
        await organizationService.updateOrganization(formData.id, {
          name: formData.name.trim(),
          code: formData.code?.trim(),
          description: formData.description?.trim(),
        });
        setFormSuccess('Organization updated successfully!');
        await refreshOrganizations();
      }

      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save organization.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setFormSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section with Stats */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Building2 className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">Workspace Management</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
                Organizations
              </h1>
              <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
                Centralized hub for managing all your collaborative workspaces, teams, and projects
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => {
                setFormMode('create');
                resetForm();
                setShowFormPanel(true);
              }}
              className="group relative bg-white text-indigo-600 hover:bg-gray-50 shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300"
            >
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-bold">Create New Organization</span>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <Building2 className="h-6 w-6 text-white/80" />
                <TrendingUp className="h-4 w-4 text-green-300" />
              </div>
              <p className="text-2xl font-black text-white">{stats.total}</p>
              <p className="text-xs text-white/70 font-medium">Total Workspaces</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <Activity className="h-6 w-6 text-white/80" />
                <CheckCircle2 className="h-4 w-4 text-green-300" />
              </div>
              <p className="text-2xl font-black text-white">{stats.active}</p>
              <p className="text-xs text-white/70 font-medium">Active Now</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <Users className="h-6 w-6 text-white/80" />
                <TrendingUp className="h-4 w-4 text-blue-300" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalMembers}</p>
              <p className="text-xs text-white/70 font-medium">Team Members</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <Award className="h-6 w-6 text-white/80" />
                <ShieldCheck className="h-4 w-4 text-yellow-300" />
              </div>
              <p className="text-2xl font-black text-white">{stats.verified}</p>
              <p className="text-xs text-white/70 font-medium">Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-12">
        {/* Alerts */}
        {(error || formError) && (
          <Alert variant="error" onClose={() => setFormError('')} className="mb-6">
            <AlertCircle className="h-5 w-5" />
            {formError || error}
          </Alert>
        )}

        {formSuccess && (
          <Alert variant="success" onClose={() => setFormSuccess('')} className="mb-6">
            <CheckCircle2 className="h-5 w-5" />
            {formSuccess}
          </Alert>
        )}

        {/* Create/Edit Form Panel - Sliding Panel */}
        {showFormPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFormPanel(false)} />
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl animate-slide-in-right">
              <div className="h-full flex flex-col">
                {/* Panel Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      {formMode === 'create' ? (
                        <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Pencil className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {formMode === 'create' ? 'New Organization' : 'Edit Organization'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowFormPanel(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Panel Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                      label="Organization Name"
                      placeholder="e.g. Acme Corporation"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="bg-gray-50 dark:bg-gray-900/50"
                    />
                    <Input
                      label="Workspace Code"
                      placeholder="e.g. ACME-HQ"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className="bg-gray-50 dark:bg-gray-900/50"
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400"
                        placeholder="Describe the purpose and scope of this organization..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowFormPanel(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                        loading={submitting}
                      >
                        {formMode === 'create' ? 'Create' : 'Update'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar - Search, Filter, Sort, View Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search organizations by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Filter Status */}
            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              <button
                onClick={() => setFilterActive(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterActive === null
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterActive(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterActive === true
                    ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterActive(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterActive === false
                    ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                Inactive
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="name">Sort by Name</option>
              <option value="members">Sort by Members</option>
              <option value="recent">Sort by Recent</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                title="Grid View"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                title="List View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || filterActive !== null || sortBy !== 'name') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterActive !== null && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                  Status: {filterActive ? 'Active' : 'Inactive'}
                  <button onClick={() => setFilterActive(null)} className="hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                  Sort: {sortBy === 'members' ? 'Members' : 'Recent'}
                  <button onClick={() => setSortBy('name')} className="hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterActive(null);
                  setSortBy('name');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Organizations List/Grid */}
        {filteredAndSortedOrgs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-16 text-center border-2 border-dashed border-gray-300 dark:border-gray-600 shadow-xl">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No organizations found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              {searchTerm || filterActive !== null
                ? 'Try adjusting your search and filter criteria.'
                : 'Get started by creating your first organization workspace.'}
            </p>
            {!searchTerm && filterActive === null && (
              <Button
                onClick={() => {
                  setFormMode('create');
                  resetForm();
                  setShowFormPanel(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Organization
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedOrgs.map((org) => {
              const isSelected = selectedOrganization?.id === org.id;
              return (
                <div
                  key={org.id}
                  className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${isSelected
                      ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                    }`}
                >
                  {/* Header Gradient */}
                  <div className={`h-2 ${isSelected
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 group-hover:from-indigo-500 group-hover:via-purple-500 group-hover:to-pink-500'
                    } transition-all duration-500`} />

                  <div className="p-4">
                    {/* Org Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-3 items-start flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transition-all duration-500 group-hover:scale-105 flex-shrink-0 ${isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-br from-gray-600 to-gray-800 group-hover:from-indigo-500 group-hover:to-purple-600'
                          }`}>
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {org.name}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                              {org.code || 'N/A'}
                            </span>
                            {org.isVerified && (
                              <ShieldCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap flex-shrink-0 ${org.isActive
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50'
                          : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    {/* Description */}
                    {org.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2 min-h-[2em]">
                        {org.description}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-2 border border-indigo-100 dark:border-indigo-800">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Members</span>
                        </div>
                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{org.memberCount || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2 border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Layers className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Depts</span>
                        </div>
                        <p className="text-xl font-black text-purple-600 dark:text-purple-400">{org.departmentCount || 0}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        className={`w-full font-semibold ${isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                          }`}
                        onClick={() => selectOrganization(org)}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>

                      <div className="flex gap-1.5">
                        <Link to={`/organizations/${org.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-full px-0 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-full px-0 border-gray-200 dark:border-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30"
                          onClick={() => handleEdit(org)}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-full px-0 border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 text-gray-400 dark:hover:bg-red-900/30"
                          onClick={() => handleDelete(org.id)}
                          disabled={submitting}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedOrgs.map((org) => {
                const isSelected = selectedOrganization?.id === org.id;
                return (
                  <div
                    key={org.id}
                    className={`group p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${isSelected
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                            : 'bg-gradient-to-br from-gray-600 to-gray-800 group-hover:from-indigo-500 group-hover:to-purple-600'
                          } transition-all duration-300`}>
                          <Building2 className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {org.name}
                            </h3>
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-md whitespace-nowrap">
                              {org.code || 'N/A'}
                            </span>
                            {org.isVerified && (
                              <ShieldCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${org.isActive
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                              {org.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                          {org.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {org.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:flex-shrink-0">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-indigo-500" />
                            <span className="font-bold text-gray-900 dark:text-white">{org.memberCount || 0}</span>
                            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">members</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-purple-500" />
                            <span className="font-bold text-gray-900 dark:text-white">{org.departmentCount || 0}</span>
                            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">depts</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            className={isSelected
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                            }
                            onClick={() => selectOrganization(org)}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="mr-1 h-4 w-4" />
                                Selected
                              </>
                            ) : (
                              'Select'
                            )}
                          </Button>

                          <Link to={`/organizations/${org.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-200 dark:border-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 dark:border-gray-700 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30"
                            onClick={() => handleEdit(org)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 text-gray-400 dark:hover:bg-red-900/30"
                            onClick={() => handleDelete(org.id)}
                            disabled={submitting}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Count */}
        {filteredAndSortedOrgs.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-white">{filteredAndSortedOrgs.length}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{organizations.length}</span> organizations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
