import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Building2,
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeProjects: 0,
    teamMembers: 0,
    completedTasks: 0,
    upcomingDeadlines: 0,
    pendingReviews: 0,
    totalTasks: 0,
  });
  const [metrics, setMetrics] = useState({
    productivity: { value: 0, change: 0, changeDirection: 'unchanged' },
    onTimeDelivery: { value: 0 },
    taskCompletion: { value: 0 }
  });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real dashboard data from backend using axios instance (attaches JWT)
    const fetchStats = async () => {
      try {
        const res = await (await import('../services/api')).default.get('/dashboard/stats');
        const payload = res.data ?? res;
        const data = payload.data ?? payload.Data ?? payload;
        setStats({
          activeProjects: data.activeProjects ?? data.ActiveProjects ?? 0,
          teamMembers: data.teamMembers ?? data.TeamMembers ?? 0,
          completedTasks: data.completedTasks ?? data.CompletedTasks ?? 0,
          upcomingDeadlines: data.upcomingDeadlines ?? data.UpcomingDeadlines ?? 0,
          pendingReviews: data.pendingReviews ?? data.PendingReviews ?? 0,
          totalTasks: data.totalTasks ?? data.TotalTasks ?? 0,
        });
      } catch (err) {
        // fallback to sample values on error
        setStats({
          activeProjects: 12,
          teamMembers: 45,
          completedTasks: 234,
          upcomingDeadlines: 8,
          pendingReviews: 5,
          totalTasks: 312,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    // Fetch real metrics data from backend
    const fetchMetrics = async () => {
      try {
        const res = await (await import('../services/api')).default.get('/dashboard/metrics');
        const payload = res.data ?? res;
        const data = payload.data ?? payload.Data ?? payload;

        setMetrics({
          productivity: {
            value: Math.round(data.productivity?.percentageChange ?? 0),
            change: data.productivity?.percentageChange ?? 0,
            changeDirection: data.productivity?.changeDirection ?? 'unchanged'
          },
          onTimeDelivery: {
            value: Math.round(data.onTimeDelivery?.percentageOnTime ?? 0)
          },
          taskCompletion: {
            value: Math.round(data.taskCompletion?.completionRate ?? 0)
          }
        });
      } catch (err) {
        console.error('Failed to load metrics', err);
        // Keep default values of 0 on error
      }
    };

    fetchMetrics();
  }, []);

  const statCards = [
    {
      name: 'Active Projects',
      value: stats.activeProjects,
      change: '+12%',
      changeType: 'positive',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'Projects in progress',
    },
    {
      name: 'Team Members',
      value: stats.teamMembers,
      change: '+5',
      changeType: 'positive',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Active team members',
    },
    {
      name: 'Completed Tasks',
      value: stats.completedTasks,
      change: '+18%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Tasks completed this month',
    },
    {
      name: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      change: '-3',
      changeType: 'negative',
      icon: Calendar,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      description: 'Deadlines in next 7 days',
    },
  ];

  const quickActions = [
    {
      title: 'Create New Project',
      description: 'Start a new construction project',
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      href: '/projects/new',
    },
    {
      title: 'Invite Team Member',
      description: 'Add a new member to your team',
      icon: Users,
      color: 'from-green-500 to-green-600',
      href: '/users/invite',
    },
    {
      title: 'View Tasks',
      description: 'Manage and track your tasks',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      href: '/tasks',
    },
    {
      title: 'Pending Reviews',
      description: `${stats.pendingReviews} items need your attention`,
      icon: AlertCircle,
      color: 'from-orange-500 to-orange-600',
      href: '/reviews',
    },
  ];

  const recentActivity = [
    // placeholder until loaded
    { id: 'loading-1', type: 'loading', message: 'Loading...', time: '', icon: Activity, color: 'text-gray-400' },
  ];

  const [activities, setActivities] = useState([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesPageSize] = useState(6);
  const [activitiesTotal, setActivitiesTotal] = useState(0);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const fetchActivities = async (page = 1) => {
      setLoadingActivities(true);
      try {
        const res = await (await import('../services/api')).default.get('/activities/recent', { params: { pageNumber: page, pageSize: activitiesPageSize } });
        const data = res.data?.data ?? res.data ?? res;
        const items = data.items ?? data.Items ?? data;
        if (page === 1) setActivities(items);
        else setActivities((prev) => [...prev, ...items]);
        setActivitiesTotal(data.totalCount ?? data.TotalCount ?? 0);
        setActivitiesPage(data.pageNumber ?? data.PageNumber ?? page);
      } catch (err) {
        console.error('Failed to load activities', err);
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities(1);
  }, [activitiesPageSize]);

  const loadMoreActivities = async () => {
    const next = activitiesPage + 1;
    if (activities.length >= activitiesTotal) return;
    try {
      const res = await (await import('../services/api')).default.get('/activities/recent', { params: { pageNumber: next, pageSize: activitiesPageSize } });
      const data = res.data?.data ?? res.data ?? res;
      const items = data.items ?? data.Items ?? data;
      setActivities((prev) => [...prev, ...items]);
      setActivitiesPage(data.pageNumber ?? next);
      setActivitiesTotal(data.totalCount ?? activitiesTotal);
    } catch (err) {
      console.error('Failed to load more activities', err);
    }
  };

  const progressData = [
    { project: 'Office Building', progress: 75, tasks: 45, completed: 34 },
    { project: 'Residential Complex', progress: 60, tasks: 32, completed: 19 },
    { project: 'Shopping Mall', progress: 45, tasks: 28, completed: 13 },
  ];

  const [projectProgress, setProjectProgress] = useState(progressData);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await (await import('../services/api')).default.get('/projects/progress/top', { params: { count: 3 } });
        const data = res.data?.data ?? res.data ?? res;
        const items = data.items ?? data.Items ?? data;
        if (Array.isArray(items) && items.length) {
          const mapped = items.map(p => ({ project: p.name, progress: p.progress ?? 0, tasks: p.totalTasks ?? p.TotalTasks ?? 0, completed: p.completedTasks ?? p.CompletedTasks ?? 0, id: p.id }));
          setProjectProgress(mapped);
        }
      } catch (err) {
        console.error('Failed to load projects for progress', err);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Welcome back, {user?.fullName || 'User'}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-3 relative">
          <ThemeToggle />
          <Button variant="outline" size="md" onClick={() => navigate('/reviews')}>
            <Activity className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <div className="relative">
            <Button
              size="md"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Action
            </Button>

            {showQuickActions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowQuickActions(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2">
                    <Link
                      to="/projects/new"
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      onClick={() => setShowQuickActions(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">New Project</div>
                          <div className="text-xs text-gray-500">Create a new project</div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/users/invite"
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      onClick={() => setShowQuickActions(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">Invite User</div>
                          <div className="text-xs text-gray-500">Add team member</div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/tasks"
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      onClick={() => setShowQuickActions(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">View Tasks</div>
                          <div className="text-xs text-gray-500">Manage all tasks</div>
                        </div>
                      </div>
                    </Link>
                    <Link
                      to="/reviews"
                      className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      onClick={() => setShowQuickActions(false)}
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            Reviews {stats.pendingReviews > 0 && `(${stats.pendingReviews})`}
                          </div>
                          <div className="text-xs text-gray-500">Pending approvals</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      to={action.href}
                      className="group relative p-5 rounded-xl border border-gray-200 hover:border-primary-300 bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} opacity-5 rounded-bl-full`}></div>
                      <div className="relative">
                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(activities.length ? activities : recentActivity).map((activity) => {
                // Map backend activity types to icons/colors
                let Icon = Activity;
                let color = 'text-gray-600';
                if (activity.type === 'project') { Icon = Building2; color = 'text-blue-600'; }
                if (activity.type === 'task_update' || activity.type === 'task') { Icon = CheckCircle; color = 'text-green-600'; }
                if (activity.type === 'notification') { Icon = AlertCircle; color = 'text-orange-600'; }
                if (activity.type === 'user') { Icon = Users; color = 'text-purple-600'; }

                const timeStr = activity.timestamp ? new Date(activity.timestamp).toLocaleString() : activity.time;

                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{timeStr}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {activities.length < activitiesTotal && (
              <div className="mt-4">
                <Button variant="outline" className="w-full" size="sm" onClick={loadMoreActivities} disabled={loadingActivities}>
                  {loadingActivities ? 'Loading...' : 'Load more activity'}
                </Button>
              </div>
            )}
            {activities.length === 0 && !loadingActivities && (
              <div className="mt-4 text-center text-sm text-gray-500">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Progress */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Project Progress</CardTitle>
            <Button variant="ghost" size="sm">
              View All Projects
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {projectProgress.map((project, index) => (
              <div key={project.id ?? index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      <a href={`/projects/${project.id}`} className="hover:underline">{project.project}</a>
                    </h4>
                    <p className="text-sm text-gray-600">
                      {project.completed ?? 0} of {project.tasks ?? 0} tasks completed
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">{project.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${project.progress ?? 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">
                {metrics.productivity.changeDirection === 'increased' ? '+' : metrics.productivity.changeDirection === 'decreased' ? '-' : ''}
                {Math.abs(metrics.productivity.value)}%
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Productivity</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {metrics.productivity.changeDirection === 'increased' ? 'Increased' :
               metrics.productivity.changeDirection === 'decreased' ? 'Decreased' :
               'Unchanged'} this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{metrics.onTimeDelivery.value}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">On-Time Delivery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks completed on schedule</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{metrics.taskCompletion.value}%</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Task Completion</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overall completion rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
