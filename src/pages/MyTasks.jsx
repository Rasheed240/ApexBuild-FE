import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrganizations } from '../contexts/OrganizationContext';
import { taskService } from '../services/taskService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { Badge } from '../components/ui/Badge';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  TrendingUp,
  ListChecks,
  Plus,
  Eye,
  CheckCheck,
} from 'lucide-react';

const priorityColors = {
  1: 'bg-blue-100 text-blue-800 border-blue-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  3: 'bg-orange-100 text-orange-800 border-orange-200',
  4: 'bg-red-100 text-red-800 border-red-200',
};

const priorityLabels = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Critical',
};

const statusColors = {
  NotStarted: 'bg-gray-100 text-gray-800 border-gray-300',
  InProgress: 'bg-blue-100 text-blue-800 border-blue-300',
  Done: 'bg-purple-100 text-purple-800 border-purple-300',
  UnderReview: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Approved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Pending: 'bg-orange-100 text-orange-800 border-orange-300',
  Cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
};

export const MyTasks = () => {
  const { selectedOrganization } = useOrganizations();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    done: 0,
    completed: 0,
  });

  useEffect(() => {
    if (selectedOrganization) {
      fetchMyTasks();
    }
  }, [selectedOrganization, statusFilter, priorityFilter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        organizationId: selectedOrganization?.id,
        pageSize: 100,
      };

      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = parseInt(priorityFilter);
      if (searchTerm) params.searchTerm = searchTerm;

      const response = await taskService.getMyTasks(params);
      const tasksList = response?.tasks || [];
      setTasks(tasksList);

      // Calculate stats
      setStats({
        total: tasksList.length,
        inProgress: tasksList.filter((t) => t.status === 'InProgress').length,
        done: tasksList.filter((t) => t.status === 'Done').length,
        completed: tasksList.filter((t) => t.status === 'Completed').length,
      });
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMyTasks();
  };

  const handleMarkDone = async (taskId) => {
    if (!confirm('Mark this task as done? You can still submit updates after.')) return;

    try {
      await taskService.markTaskDone(taskId, 'Task completed');
      fetchMyTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark task as done');
    }
  };

  if (!selectedOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Organization Selected
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Please select an organization to view your tasks
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Tasks</h1>
            <p className="text-white/90">
              Tasks assigned to you in {selectedOrganization?.name}
            </p>
          </div>
          <ListChecks className="h-12 w-12 text-white/80" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-white/80">Total Tasks</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <div className="text-sm text-white/80">In Progress</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-2xl font-bold">{stats.done}</div>
            <div className="text-sm text-white/80">Done</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-sm text-white/80">Completed</div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={Search}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="NotStarted">Not Started</option>
              <option value="InProgress">In Progress</option>
              <option value="Done">Done</option>
              <option value="UnderReview">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Priority</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Critical</option>
            </select>
            <Button type="submit">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ListChecks className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter || priorityFilter || searchTerm
                ? 'Try adjusting your filters'
                : 'You have no tasks assigned in this organization'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h3>
                      <Badge className={statusColors[task.status] || statusColors.NotStarted}>
                        {task.status}
                      </Badge>
                      <Badge className={priorityColors[task.priority] || priorityColors[1]}>
                        {priorityLabels[task.priority] || 'Low'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{task.departmentName}</span>
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{task.progress}% Complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link to={`/tasks/${task.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {task.status === 'InProgress' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkDone(task.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark Done
                      </Button>
                    )}
                    {(task.status === 'Done' || task.status === 'InProgress') && (
                      <Link to={`/tasks/${task.id}/submit`}>
                        <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Submit Work
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
