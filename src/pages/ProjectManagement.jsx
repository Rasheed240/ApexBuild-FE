import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { uploadProjectMedia } from '../services/mediaService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MediaGallery } from '../components/ui/MediaGallery';
import {
  Plus,
  ChevronRight,
  Filter,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Calendar,
  Target,
  Loader,
  MessageSquare,
  Paperclip,
  TrendingUp,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';

export const ProjectManagement = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [expandedTask, setExpandedTask] = useState(null);

  const pageSize = 20;

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId, statusFilter, priorityFilter, pageNumber]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch project
      const projectRes = await api.get(`/projects/${projectId}`);
      const projectData = projectRes.data?.data || projectRes.data;

      if (!projectData) {
        setError('Project not found');
        setProject(null);
        setTasks([]);
        return;
      }

      setProject(projectData);

      // Fetch tasks (exclude subtasks - they're shown in task detail page)
      const tasksRes = await api.get(`/projects/${projectId}/tasks`, {
        params: {
          pageNumber,
          pageSize,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          searchTerm: searchTerm || undefined,
          includeSubtasks: false,
          includeUpdates: true,
        },
      });

      setTasks(tasksRes.data?.data?.tasks || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      const status = err.response?.status;
      const message = err.response?.data?.message || err.message;

      if (status === 404) {
        setError('Project not found. It may have been deleted or you may not have access to it.');
      } else if (status === 403) {
        setError('You do not have permission to view this project.');
      } else {
        setError(message || 'Failed to load project');
      }

      setProject(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      NotStarted: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      InProgress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      Completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      Blocked: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      OnHold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    };
    return colors[status] || colors.NotStarted;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: 'text-gray-500 dark:text-gray-400',
      2: 'text-blue-500 dark:text-blue-400',
      3: 'text-orange-500 dark:text-orange-400',
      4: 'text-red-500 dark:text-red-400',
    };
    return colors[priority] || colors[1];
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
    return labels[priority] || 'Unknown';
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const daysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleMediaUpload = async (file, mediaType = 'image') => {
    try {
      setUploadingMedia(true);
      setError('');

      const result = await uploadProjectMedia(projectId, file, mediaType);

      // Update project with new media URL
      setProject(prev => ({
        ...prev,
        imageUrls: [...(prev.imageUrls || []), result.url],
      }));
    } catch (err) {
      console.error('Error uploading media:', err);
      setError(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  // Error state - project not found
  if (error && !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-4 w-4" />
            <span>Error</span>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-500 dark:text-red-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Project Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {error}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Go Back
                </Button>
                <Button onClick={() => navigate('/projects')} className="gap-2">
                  View All Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-4 w-4" />
            <span>{project?.name || 'Project'}</span>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {project?.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {project?.description}
              </p>
            </div>
            <Button onClick={() => navigate(`/projects/${projectId}/tasks/new`)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {tasks.length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {tasks.filter(t => t.status === 'InProgress').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {tasks.filter(t => t.status === 'Completed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {tasks.length > 0
                        ? Math.round(
                            tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
                          )
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPageNumber(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageNumber(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="NotStarted">Not Started</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Blocked">Blocked</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPageNumber(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Priority</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
                <option value="4">Critical</option>
              </select>

              {/* Clear Filters */}
              {(statusFilter || priorityFilter || searchTerm) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setSearchTerm('');
                    setPageNumber(1);
                  }}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Media Gallery */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Project Images
              </CardTitle>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleMediaUpload(file, 'image');
                  }}
                  disabled={uploadingMedia}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingMedia}
                  as="span"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingMedia ? 'Uploading...' : 'Upload Image'}
                </Button>
              </label>
            </div>
          </CardHeader>
          <CardContent>
            {project?.imageUrls && project.imageUrls.length > 0 ? (
              <MediaGallery items={project.imageUrls} columns={3} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                No images uploaded yet. Upload images to showcase this project.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => {
              const days = daysUntilDue(task.dueDate);
              const isOverdue = days !== null && days < 0;
              const isDueSoon = days !== null && days >= 0 && days <= 3;

              return (
                <Card
                  key={task.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    setExpandedTask(expandedTask === task.id ? null : task.id)
                  }
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Task Info */}
                      <div className="md:col-span-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {task.code}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {task.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Priority */}
                      <div className="md:col-span-2 flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}>
                          {task.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 ${getPriorityColor(
                          task.priority
                        )}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="md:col-span-2">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="text-xs font-semibold text-primary-600">
                            {Math.round(task.progress)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="md:col-span-2">
                        <div
                          className={`flex items-center gap-2 text-xs ${
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : isDueSoon
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                          {task.dueDate ? (
                            <>
                              <span className="font-medium">{formatDate(task.dueDate)}</span>
                              {days !== null && (
                                <span className={`${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                  ({isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`})
                                </span>
                              )}
                            </>
                          ) : (
                            <span>No due date</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedTask === task.id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        {/* Description */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.description || 'No description'}
                          </p>
                        </div>

                        {/* Assignee & Timeline */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                              Assigned To
                            </h4>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {task.assignedToUserName || 'Unassigned'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-2">
                              Start Date
                            </h4>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatDate(task.startDate)}
                            </p>
                          </div>
                        </div>

                        {/* Subtasks */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Subtasks ({task.subTaskCount})
                            </h4>
                            <div className="space-y-2">
                              {task.subtasks.slice(0, 3).map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-800"
                                >
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      subtask.status === 'Completed'
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                    }`}
                                  />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {subtask.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Activity */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Updates</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {task.updateCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Comments</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                              {task.commentCount}
                              <MessageSquare className="h-4 w-4" />
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Team</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                              {task.subTaskCount || 1}
                              <Users className="h-4 w-4" />
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tasks/${task.id}`)}
                            className="flex-1 gap-2"
                          >
                            <ChevronRight className="h-3 w-3" />
                            View Details
                          </Button>
                          <Button size="sm" className="flex-1 gap-2">
                            <MessageSquare className="h-3 w-3" />
                            Comment
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
