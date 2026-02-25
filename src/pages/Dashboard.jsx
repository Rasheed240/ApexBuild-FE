import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Building2, Users, Calendar, CheckCircle, TrendingUp, Clock,
  AlertCircle, Activity, Target, Zap, Flag,
  AlertTriangle, ChevronRight, LayoutGrid, UserPlus, CreditCard,
  ClipboardList, FolderKanban, X, ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const timeAgo = (ts) => {
  if (!ts) return '';
  const secs = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

function ProgressBar({ value, color = 'bg-primary-500', className = '' }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { user } = useAuth();
  const { selectedOrganization } = useOrganizations();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Navigate to the overdue task(s): directly if only 1, list view if multiple
  const handleViewOverdue = async () => {
    try {
      const params = { isOverdue: true, pageSize: 2 };
      if (selectedOrganization?.id) params.organizationId = selectedOrganization.id;
      const res = await api.get('/tasks/my-tasks', { params });
      const data = res.data?.data ?? res.data;
      const list = data?.tasks || data?.items || data?.Items || (Array.isArray(data) ? data : []);
      if (list.length === 1) {
        navigate(`/tasks/${list[0].id}`);
      } else {
        navigate('/tasks?overdue=true');
      }
    } catch {
      navigate('/tasks');
    }
  };

  // Navigate to tasks with upcoming deadlines (within 7 days)
  const handleViewUpcoming = async () => {
    navigate('/tasks?upcoming=true');
  };

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const params = selectedOrganization?.id ? { organizationId: selectedOrganization.id } : {};
      const res = await api.get('/dashboard/stats', { params });
      const d = res.data?.data ?? res.data ?? {};
      setStats({
        activeProjects: d.activeProjects ?? d.ActiveProjects ?? 0,
        teamMembers: d.teamMembers ?? d.TeamMembers ?? 0,
        completedTasks: d.completedTasks ?? d.CompletedTasks ?? 0,
        upcomingDeadlines: d.upcomingDeadlines ?? d.UpcomingDeadlines ?? 0,
        pendingReviews: d.pendingReviews ?? d.PendingReviews ?? 0,
        totalTasks: d.totalTasks ?? d.TotalTasks ?? 0,
        overdueTasks: d.overdueTasks ?? d.OverdueTasks ?? 0,
        inProgressTasks: d.inProgressTasks ?? d.InProgressTasks ?? 0,
        notStartedTasks: d.notStartedTasks ?? d.NotStartedTasks ?? 0,
        underReviewTasks: d.underReviewTasks ?? d.UnderReviewTasks ?? 0,
        rejectedTasks: d.rejectedTasks ?? d.RejectedTasks ?? 0,
      });
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, [selectedOrganization]);

  const fetchMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const res = await api.get('/dashboard/metrics');
      const d = res.data?.data ?? res.data ?? {};
      setMetrics({
        productivity: {
          value: Math.abs(Math.round(d.productivity?.percentageChange ?? 0)),
          direction: d.productivity?.changeDirection ?? 'unchanged',
        },
        onTimeDelivery: Math.round(d.onTimeDelivery?.percentageOnTime ?? 0),
        taskCompletion: Math.round(d.taskCompletion?.completionRate ?? 0),
      });
    } catch {
      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const res = await api.get('/activities/recent', { params: { pageSize: 8 } });
      const d = res.data?.data ?? res.data ?? {};
      setActivities(d.items ?? d.Items ?? []);
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const params = { count: 5 };
      if (selectedOrganization?.id) params.organizationId = selectedOrganization.id;
      const res = await api.get('/projects/progress/top', { params });
      const d = res.data?.data ?? res.data ?? {};
      setProjects((d.items ?? d.Items ?? []).map(p => ({
        id: p.id ?? p.Id,
        name: p.name ?? p.Name,
        progress: p.progress ?? p.Progress ?? 0,
        totalTasks: p.totalTasks ?? p.TotalTasks ?? 0,
        completedTasks: p.completedTasks ?? p.CompletedTasks ?? 0,
      })));
    } catch {
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedOrganization]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
  useEffect(() => { fetchActivities(); }, [fetchActivities]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const s = stats;
  const totalForBreakdown = s ? (s.notStartedTasks + s.inProgressTasks + s.underReviewTasks + s.completedTasks + s.rejectedTasks) : 0;
  const pct = (n) => totalForBreakdown > 0 ? Math.round((n / totalForBreakdown) * 100) : 0;

  const statCards = s ? [
    { name: 'Active Projects', value: s.activeProjects, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', bar: 'from-blue-500 to-blue-600' },
    { name: 'Team Members', value: s.teamMembers, icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', bar: 'from-green-500 to-green-600' },
    { name: 'Completed Tasks', value: s.completedTasks, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', bar: 'from-purple-500 to-purple-600' },
    { name: 'Pending Reviews', value: s.pendingReviews, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', bar: 'from-orange-500 to-orange-600', link: '/reviews' },
  ] : [];

  const activityIcon = (type) => {
    if (type === 'project') return { Icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' };
    if (type === 'task_update' || type === 'task') return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' };
    if (type === 'notification') return { Icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' };
    if (type === 'user') return { Icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' };
    return { Icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' };
  };

  // ── Role detection ─────────────────────────────────────────────────────────
  const myRole = (() => {
    const names = (user?.roles || []).map(r => (typeof r === 'object' ? r.roleName || r.name : r));
    if (names.some(n => ['SuperAdmin', 'PlatformAdmin'].includes(n))) return 'superAdmin';
    if (names.some(n => ['ProjectOwner', 'ProjectAdministrator'].includes(n))) return 'admin';
    if (names.includes('DepartmentSupervisor')) return 'supervisor';
    if (names.includes('ContractorAdmin')) return 'contractorAdmin';
    return 'fieldWorker';
  })();

  const roleLabelMap = {
    superAdmin: 'Super Admin',
    admin: 'Administrator',
    supervisor: 'Supervisor',
    contractorAdmin: 'Contractor Admin',
    fieldWorker: 'Field Worker',
  };

  const roleActions = {
    superAdmin: [
      { to: '/projects/new', Icon: FolderKanban, label: 'New Project', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
      { to: '/users/invite', Icon: UserPlus, label: 'Invite Member', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
      { to: '/organizations', Icon: Building2, label: 'Organisations', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { to: '/subscriptions', Icon: CreditCard, label: 'Subscriptions', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
      { to: '/tasks', Icon: ClipboardList, label: 'All Tasks', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
      { to: '/reviews', Icon: ShieldCheck, label: 'All Reviews', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30' },
    ],
    admin: [
      { to: '/projects/new', Icon: FolderKanban, label: 'New Project', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
      { to: '/users/invite', Icon: UserPlus, label: 'Invite Member', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
      { to: '/tasks', Icon: ClipboardList, label: 'View Tasks', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' },
      { to: '/reviews', Icon: ShieldCheck, label: 'Reviews', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
      { to: '/projects', Icon: Building2, label: 'Projects', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { to: '/members', Icon: Users, label: 'Team Members', color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/30' },
    ],
    supervisor: [
      { to: '/tasks', Icon: ClipboardList, label: 'My Tasks', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
      { to: '/reviews', Icon: ShieldCheck, label: 'Reviews', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
      { to: '/projects', Icon: Building2, label: 'Projects', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { to: '/members', Icon: Users, label: 'Team Members', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    ],
    contractorAdmin: [
      { to: '/tasks', Icon: ClipboardList, label: 'My Tasks', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
      { to: '/reviews', Icon: ShieldCheck, label: 'Reviews', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
      { to: '/projects', Icon: Building2, label: 'Projects', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { to: '/members', Icon: Users, label: 'Team', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    ],
    fieldWorker: [
      { to: '/tasks', Icon: ClipboardList, label: 'My Tasks', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
      { to: '/reviews', Icon: ShieldCheck, label: 'My Updates', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
      { to: '/projects', Icon: Building2, label: 'Projects', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
      { to: '/profile', Icon: Users, label: 'My Profile', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header banner ───────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-[#0f1629] to-slate-950">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 relative">
          <div className="flex items-center gap-5">
            <img src="/apexbuild-image.png" alt="ApexBuild" className="h-16 object-contain flex-shrink-0" />
            <div className="border-l border-slate-700/60 pl-5">
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.fullName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="mt-0.5 text-slate-400 text-sm">
                {selectedOrganization ? selectedOrganization.name : 'All organizations'} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 relative">
            <Button
              size="md"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Actions
            </Button>

            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQuickActions(false)} />
                <div className="absolute right-0 mt-3 w-[calc(100vw-3rem)] sm:w-72 max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-primary-500" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-medium">
                      {roleLabelMap[myRole]}
                    </span>
                  </div>
                  {/* Action grid */}
                  <div className="p-3 grid grid-cols-3 gap-2">
                    {(roleActions[myRole] || []).map(({ to, Icon, label, color, bg }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setShowQuickActions(false)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors text-center group"
                      >
                        <div className={`p-2.5 rounded-xl ${bg} transition-transform group-hover:scale-110`}>
                          <Icon className={`h-4 w-4 ${color}`} />
                        </div>
                        <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-tight">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats
          ? Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-lg h-32" />
          ))
          : statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.name} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 cursor-default">
                <div className={`h-1 bg-gradient-to-r ${card.bar}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{card.name}</p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{card.value}</p>
                    </div>
                    <div className={`p-2.5 rounded-xl ${card.bg}`}>
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </div>
                  {card.link && card.value > 0 && (
                    <Link to={card.link} className={`mt-2 text-xs font-medium flex items-center gap-1 ${card.color} hover:underline`}>
                      Review now <ChevronRight className="h-3 w-3" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* ── Alert row: overdue + upcoming ──────────────────────────── */}
      {!loadingStats && s && (s.overdueTasks > 0 || s.upcomingDeadlines > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {s.overdueTasks > 0 && (
            <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <div className="p-2.5 bg-red-100 dark:bg-red-800/40 rounded-xl flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-red-700 dark:text-red-300">{s.overdueTasks} overdue task{s.overdueTasks !== 1 ? 's' : ''}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Past due date and not yet completed</p>
              </div>
              <button onClick={handleViewOverdue}
                className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 flex-shrink-0">
                View <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
          {s.upcomingDeadlines > 0 && (
            <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-800/40 rounded-xl flex-shrink-0">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-amber-700 dark:text-amber-300">{s.upcomingDeadlines} deadline{s.upcomingDeadlines !== 1 ? 's' : ''} in 7 days</p>
                <p className="text-xs text-amber-500 dark:text-amber-400 mt-0.5">Tasks due within the next week</p>
              </div>
              <button onClick={handleViewUpcoming}
                className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 flex-shrink-0">
                View <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Main content row ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Task Status Breakdown */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><LayoutGrid className="h-4 w-4" /> Task Pipeline</CardTitle>
              <Link to="/tasks" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                All tasks <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
              </div>
            ) : s ? (
              <div className="space-y-3">
                {[
                  { label: 'Not Started', count: s.notStartedTasks, color: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-400', ring: 'bg-gray-100 dark:bg-gray-700' },
                  { label: 'In Progress', count: s.inProgressTasks, color: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', ring: 'bg-blue-50 dark:bg-blue-900/30' },
                  { label: 'Under Review', count: s.underReviewTasks, color: 'bg-yellow-500', text: 'text-yellow-700 dark:text-yellow-300', ring: 'bg-yellow-50 dark:bg-yellow-900/30' },
                  { label: 'Completed', count: s.completedTasks, color: 'bg-green-500', text: 'text-green-700 dark:text-green-300', ring: 'bg-green-50 dark:bg-green-900/30' },
                  { label: 'Rejected', count: s.rejectedTasks, color: 'bg-red-500', text: 'text-red-700 dark:text-red-300', ring: 'bg-red-50 dark:bg-red-900/30' },
                ].map(({ label, count, color, text, ring }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`w-28 flex-shrink-0 text-xs font-medium ${text}`}>{label}</div>
                    <div className="flex-1">
                      <ProgressBar value={pct(count)} color={color} />
                    </div>
                    <div className={`flex-shrink-0 min-w-[3rem] text-right`}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ring} ${text}`}>{count}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{s.totalTasks} total tasks</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{pct(s.completedTasks)}% complete</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMetrics ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
              </div>
            ) : metrics ? (
              <>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Productivity</span>
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {metrics.productivity.direction === 'increased' ? '+' : metrics.productivity.direction === 'decreased' ? '-' : ''}
                      {metrics.productivity.value}%
                    </span>
                  </div>
                  <p className="text-xs text-blue-500 dark:text-blue-400">
                    Task completions {metrics.productivity.direction} this month
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">On-Time Delivery</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-300">{metrics.onTimeDelivery}%</span>
                  </div>
                  <ProgressBar value={metrics.onTimeDelivery} color="bg-green-500" />
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Completion Rate</span>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-300">{metrics.taskCompletion}%</span>
                  </div>
                  <ProgressBar value={metrics.taskCompletion} color="bg-purple-500" />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No metrics yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row: projects + activity ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Project Progress */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Flag className="h-4 w-4" /> Project Progress</CardTitle>
              <Link to="/projects" className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                All projects <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No projects yet</p>
                <Link to="/projects/new" className="mt-3 inline-block text-xs font-medium text-primary-600 hover:underline">Create your first project</Link>
              </div>
            ) : (
              <div className="space-y-5">
                {projects.map((p) => {
                  const barColor = p.progress === 100 ? 'bg-green-500' : p.progress >= 60 ? 'bg-blue-500' : p.progress >= 30 ? 'bg-yellow-500' : 'bg-gray-400';
                  return (
                    <div key={p.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <Link to={`/projects/${p.id}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
                          {p.name}
                        </Link>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-3 flex-shrink-0">{p.progress}%</span>
                      </div>
                      <ProgressBar value={p.progress} color={barColor} />
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{p.completedTasks} / {p.totalTasks} tasks</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingActivities ? (
              <div className="space-y-1 px-5 pb-5">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 px-5">
                <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {activities.map((a, i) => {
                  const { Icon, color, bg } = activityIcon(a.type ?? a.Type);
                  const msg = a.message ?? a.Message ?? '';
                  const ts = a.timestamp ?? a.Timestamp;
                  const link = a.link ?? a.Link;
                  const row = (
                    <div className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className={`mt-0.5 flex-shrink-0 p-1.5 rounded-lg ${bg}`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{msg}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{timeAgo(ts)}</p>
                      </div>
                    </div>
                  );
                  return link
                    ? <Link key={a.id ?? i} to={link}>{row}</Link>
                    : <div key={a.id ?? i}>{row}</div>;
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
