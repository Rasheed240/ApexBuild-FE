import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Plus, Search, Filter, Clock, Users, Calendar, TrendingUp,
  Image as ImageIcon, LayoutGrid, List,
} from 'lucide-react';
import { TaskFormModal } from '../components/tasks/TaskFormModal';

export const TasksPage = () => {
  const { selectedOrganization } = useOrganizations();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [selectedOrganization, activeTab]);

  const fetchTasks = async () => {
    if (!selectedOrganization?.id) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const params = {
        organizationId: selectedOrganization.id,
        searchTerm: searchTerm || undefined,
      };

      // Add assignedToUserId filter when "My Tasks" tab is active
      if (activeTab === 'my' && user?.id) {
        params.assignedToUserId = user.id;
      }

      const res = await api.get('/tasks', { params });
      const responseData = res.data?.data || res.data;
      setTasks(responseData?.tasks || responseData || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      0: 'default', 1: 'default', 2: 'info', 3: 'info',
      4: 'warning', 5: 'danger', 6: 'success',
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      0: 'Pending', 1: 'Not Started', 2: 'In Progress',
      3: 'Under Review', 4: 'On Hold', 5: 'Cancelled', 6: 'Completed',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
    return labels[priority] || priority;
  };

  const getPriorityVariant = (priority) => {
    const map = { 1: 'default', 2: 'info', 3: 'warning', 4: 'danger' };
    return map[priority] || 'default';
  };

  const getTaskImage = (task) => {
    if (task.imageUrls && task.imageUrls.length > 0) {
      return task.imageUrls[0];
    }
    // Default gradient based on status
    const gradients = {
      0: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      1: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      2: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      3: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      4: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      5: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      6: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    };
    return gradients[task.status] || gradients[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  if (!selectedOrganization) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please select an organization to view tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Tasks
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and track your project tasks
              </p>
            </div>
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Task
            </Button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'all'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab('my')}
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === 'my'
                  ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My Tasks
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchTasks()}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-all shadow-sm"
              />
            </div>
            <Button variant="outline" className="px-6">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
            {/* View toggle */}
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Create your first task to get started on your project
              </p>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                onClick={() => setIsTaskModalOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Task
              </Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* ── Grid View ─────────────────────────────────────────────────── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const taskImage = getTaskImage(task);
              const isGradient = taskImage.startsWith('linear-gradient');
              return (
                <Link key={task.id} to={`/tasks/${task.id}`} className="group block h-full">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden shrink-0">
                      {isGradient ? (
                        <div className="absolute inset-0" style={{ background: taskImage }}>
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                      ) : (
                        <img src={taskImage} alt={task.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                      )}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Badge variant={getStatusVariant(task.status)} className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                          {getStatusLabel(task.status)}
                        </Badge>
                        {task.priority && (
                          <Badge variant={getPriorityVariant(task.priority)} size="sm" className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
                            {getPriorityLabel(task.priority)}
                          </Badge>
                        )}
                      </div>
                      {task.progress != null && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
                          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${task.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {task.title || 'Untitled Task'}
                      </h3>
                      {task.code && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono mb-3">{task.code}</p>}
                      {task.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">{task.description}</p>}
                      <div className="space-y-2 mt-auto">
                        {task.departmentName && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" /><span>{task.departmentName}</span>
                          </div>
                        )}
                        {task.assignees && task.assignees.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>
                              {task.assignees.slice(0, 2).map(a => a.userName).join(', ')}
                              {task.assignees.length > 2 && ` +${task.assignees.length - 2} more`}
                            </span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" /><span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.progress != null && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <TrendingUp className="w-4 h-4" /><span>{task.progress}% Complete</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── List View ─────────────────────────────────────────────────── */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span className="col-span-4">Task</span>
              <span className="col-span-2">Department</span>
              <span className="col-span-2">Assignees</span>
              <span className="col-span-1">Priority</span>
              <span className="col-span-1">Progress</span>
              <span className="col-span-2">Due Date</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {tasks.map(task => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="group block">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    {/* Task title + code + status */}
                    <div className="md:col-span-4 flex items-start gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ background: getTaskImage(task).startsWith('linear') ? getTaskImage(task) : '#6366f1' }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate transition-colors">
                          {task.title || 'Untitled Task'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.code && <span className="text-xs font-mono text-indigo-500">{task.code}</span>}
                          <Badge variant={getStatusVariant(task.status)} size="sm">{getStatusLabel(task.status)}</Badge>
                        </div>
                      </div>
                    </div>
                    {/* Department */}
                    <div className="md:col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                      {task.departmentName || '—'}
                    </div>
                    {/* Assignees */}
                    <div className="md:col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                      {task.assignees && task.assignees.length > 0 ? (
                        <span>
                          {task.assignees[0].userName}
                          {task.assignees.length > 1 && <span className="text-gray-400"> +{task.assignees.length - 1}</span>}
                        </span>
                      ) : '—'}
                    </div>
                    {/* Priority */}
                    <div className="md:col-span-1 flex items-center">
                      {task.priority ? (
                        <Badge variant={getPriorityVariant(task.priority)} size="sm">{getPriorityLabel(task.priority)}</Badge>
                      ) : '—'}
                    </div>
                    {/* Progress */}
                    <div className="md:col-span-1 flex items-center gap-2">
                      {task.progress != null && (
                        <>
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8 text-right">{task.progress}%</span>
                        </>
                      )}
                    </div>
                    {/* Due date */}
                    <div className="md:col-span-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchTasks}
      />
    </div>
  );
};
