import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Plus,
  Search,
  AlertCircle,
  Loader,
  Building2,
  ArrowRight,
  Grid,
  List,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useOrganizations } from '../contexts/OrganizationContext';

export const ProjectsList = () => {
  const navigate = useNavigate();
  const { selectedOrganization } = useOrganizations();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchProjects();
    }
  }, [searchTerm, pageNumber, selectedOrganization]);

  const fetchProjects = async () => {
    if (!selectedOrganization?.id) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await api.get('/projects', {
        params: {
          organizationId: selectedOrganization.id,
          pageNumber,
          pageSize: 12,
          searchTerm: searchTerm || undefined,
        },
      });

      setProjects(res.data?.data?.projects || res.data?.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Planning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      Active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      OnHold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      Completed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    };
    return colors[status] || colors.Planning;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Projects
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and track your construction projects
              </p>
            </div>
            <Button onClick={() => navigate('/projects/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first project to get started
              </p>
              <Button onClick={() => navigate('/projects/new')} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {projects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="pt-6">
                  {/* Cover Image */}
                  {project.coverImageUrl && (
                    <div className="mb-4 -mx-6 -mt-6 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg overflow-hidden">
                      <img
                        src={project.coverImageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Status */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>

                    {/* Project Details */}
                    <div className="space-y-2 text-sm">
                      {project.projectType && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Building2 className="h-4 w-4" />
                          <span>{project.projectType}</span>
                        </div>
                      )}

                      {project.location && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{project.location}</span>
                        </div>
                      )}

                      {project.expectedEndDate && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.expectedEndDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Budget</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {project.budget ? `${project.currency || 'USD'} ${(project.budget / 1000).toFixed(0)}K` : '-'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Team</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                          <Users className="h-3 w-3" />
                          0
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                        <p className="text-sm font-semibold text-primary-600">
                          <TrendingUp className="h-3 w-3 inline" />
                          0%
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      variant="outline"
                      className="w-full gap-2 mt-4 group-hover:border-primary-500 group-hover:text-primary-600"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
