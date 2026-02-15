import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { contractorService, CONTRACTOR_STATUS_COLORS, CONTRACTOR_STATUS_LABELS } from '../services/contractorService';
import { departmentService } from '../services/departmentService';
import { milestoneService, MILESTONE_STATUS_COLORS, MILESTONE_STATUS_LABELS } from '../services/milestoneService';
import { taskService, TASK_STATUS_LABELS } from '../services/taskService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Plus, ChevronRight, Filter, Search, AlertCircle, Clock, CheckCircle,
  AlertTriangle, Users, Calendar, Target, Loader, MessageSquare, TrendingUp,
  Image as ImageIcon, Upload, Building2, Milestone, Briefcase, Flag,
  MapPin, DollarSign, BarChart2, HardHat, Layers, Edit2, ExternalLink,
} from 'lucide-react';

const TABS = [
  { id: 'overview',     label: 'Overview',     icon: BarChart2   },
  { id: 'tasks',        label: 'Tasks',        icon: Target       },
  { id: 'milestones',   label: 'Milestones',   icon: Flag         },
  { id: 'contractors',  label: 'Contractors',  icon: HardHat      },
  { id: 'departments',  label: 'Departments',  icon: Layers       },
  { id: 'members',      label: 'Members',      icon: Users        },
];

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount, currency = 'NGN') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
};

const daysUntil = (date) => {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
};

// ─────────────────────────────────────────────────────────────────────────────
// Task status helpers
// ─────────────────────────────────────────────────────────────────────────────
const TASK_STATUS_COLORS = {
  NotStarted: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  InProgress:  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  UnderReview: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
  OnHold:      'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  Approved:    'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200',
  Completed:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  Rejected:    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  Cancelled:   'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

const PRIORITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const PRIORITY_COLORS = {
  1: 'text-gray-500', 2: 'text-blue-500', 3: 'text-orange-500', 4: 'text-red-500',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ProgressBar({ value, className = '' }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const color = pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-gray-400';
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'text-primary-600', bg = 'bg-primary-50 dark:bg-primary-900/20' }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`${bg} rounded-xl p-3`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ project, tasks, milestones, contractors, departments }) {
  const completedTasks  = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'InProgress').length;
  const avgProgress     = tasks.length ? Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / tasks.length) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"     value={tasks.length}      icon={Target}      color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
        <StatCard label="In Progress"     value={inProgressTasks}   icon={Clock}       color="text-blue-600"   bg="bg-blue-50 dark:bg-blue-900/20"   />
        <StatCard label="Completed"       value={completedTasks}    icon={CheckCircle} color="text-green-600"  bg="bg-green-50 dark:bg-green-900/20"  />
        <StatCard label="Avg Progress"    value={`${avgProgress}%`} icon={TrendingUp}  color="text-primary-600" />
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Type</p>
                <p className="font-medium text-gray-900 dark:text-white">{project.projectType || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Status</p>
                <p className="font-medium text-gray-900 dark:text-white">{project.status || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Start Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(project.startDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Expected End</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(project.expectedEndDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                <p className="font-medium text-gray-900 dark:text-white">{project.location || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Budget</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(project.budget, project.currency)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Milestones Summary */}
          {milestones.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Flag className="h-4 w-4" /> Milestones</CardTitle>
                  <span className="text-xs text-gray-500">{milestones.filter(m => m.status === 'Completed').length}/{milestones.length} complete</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestones.slice(0, 4).map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'Completed' ? 'bg-green-500' : m.status === 'InProgress' ? 'bg-blue-500' : m.status === 'Delayed' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title}</p>
                      <ProgressBar value={m.progress} className="mt-1" />
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{Math.round(m.progress || 0)}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Team Overview</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2"><Layers className="h-4 w-4" /> Departments</span>
                <span className="font-semibold text-gray-900 dark:text-white">{departments.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2"><HardHat className="h-4 w-4" /> Contractors</span>
                <span className="font-semibold text-gray-900 dark:text-white">{contractors.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2"><Flag className="h-4 w-4" /> Milestones</span>
                <span className="font-semibold text-gray-900 dark:text-white">{milestones.length}</span>
              </div>
            </CardContent>
          </Card>

          {contractors.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Active Contractors</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {contractors.filter(c => c.status === 'Active').map(c => (
                  <div key={c.id} className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">{c.companyName}</p>
                    <p className="text-xs text-gray-500">{c.specialization}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TASKS TAB ───────────────────────────────────────────────────────────────
function TasksTab({ projectId, navigate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskService.getProjectTasks(projectId, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        searchTerm: searchTerm || undefined,
        includeSubtasks: false,
        pageSize: 50,
      });
      setTasks(data?.tasks || data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [projectId, statusFilter, priorityFilter]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchTasks();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks… (Enter)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Status</option>
              <option value="NotStarted">Not Started</option>
              <option value="InProgress">In Progress</option>
              <option value="UnderReview">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="OnHold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">All Priority</option>
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
              <option value="4">Critical</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/new?projectId=${projectId}`)} className="gap-1">
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>
      ) : tasks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">No tasks found</CardContent></Card>
      ) : (
        tasks.map(task => {
          const days = daysUntil(task.dueDate);
          const isOverdue = days !== null && days < 0;

          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start gap-4">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{task.code}</span>
                      {task.contractorName && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                          {task.contractorName}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{task.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {task.departmentName} · {task.assignedToUserName || 'Unassigned'}
                    </p>
                  </div>

                  {/* Center: status + priority */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${TASK_STATUS_COLORS[task.status] || ''}`}>
                      {TASK_STATUS_LABELS[task.status] || task.status}
                    </span>
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority] || ''}`}>
                      {PRIORITY_LABELS[task.priority] || ''} Priority
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round(task.progress || 0)}%</span>
                  </div>
                  <ProgressBar value={task.progress} />
                </div>

                {/* Due date + expand */}
                <div className="flex items-center justify-between mt-3">
                  {task.dueDate ? (
                    <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.dueDate)}
                      {days !== null && <span>({isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`})</span>}
                    </span>
                  ) : <span />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="text-xs gap-1"
                  >
                    View Details <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

// ─── MILESTONES TAB ──────────────────────────────────────────────────────────
function MilestonesTab({ projectId, navigate }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    milestoneService.getByProject(projectId)
      .then(data => setMilestones(Array.isArray(data) ? data : []))
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleComplete = async (id) => {
    setCompleting(id);
    try {
      await milestoneService.complete(id);
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed', progress: 100 } : m));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to complete milestone');
    } finally {
      setCompleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1" onClick={() => navigate(`/projects/${projectId}/milestones`)}>
          <Plus className="h-4 w-4" /> Add Milestone
        </Button>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>
      ) : milestones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Flag className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No milestones yet</p>
            <Button size="sm" className="mt-4" onClick={() => navigate(`/projects/${projectId}/milestones`)}>Add First Milestone</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-4">
            {milestones.map((m, idx) => {
              const days = daysUntil(m.dueDate);
              const isOverdue = m.status !== 'Completed' && days !== null && days < 0;

              return (
                <div key={m.id} className="flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    m.status === 'Completed' ? 'bg-green-500' :
                    m.status === 'InProgress' ? 'bg-blue-500' :
                    isOverdue ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    {m.status === 'Completed'
                      ? <CheckCircle className="h-5 w-5 text-white" />
                      : <span className="text-xs font-bold text-white">{idx + 1}</span>
                    }
                  </div>

                  <Card className="flex-1">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{m.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MILESTONE_STATUS_COLORS[m.status] || ''}`}>
                              {MILESTONE_STATUS_LABELS[m.status] || m.status}
                            </span>
                            {isOverdue && <span className="text-xs text-red-600 dark:text-red-400 font-medium">OVERDUE</span>}
                          </div>
                          {m.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{m.description}</p>}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {formatDate(m.dueDate)}</span>
                            {m.completedAt && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-3 w-3" /> {formatDate(m.completedAt)}</span>}
                          </div>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span><span>{Math.round(m.progress || 0)}%</span>
                            </div>
                            <ProgressBar value={m.progress} />
                          </div>
                        </div>
                        {m.status !== 'Completed' && m.status !== 'Cancelled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={completing === m.id}
                            onClick={() => handleComplete(m.id)}
                            className="flex-shrink-0"
                          >
                            {completing === m.id ? <Loader className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                            Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTRACTORS TAB ─────────────────────────────────────────────────────────
function ContractorsTab({ projectId, navigate }) {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractorService.getByProject(projectId)
      .then(data => setContractors(Array.isArray(data) ? data : []))
      .catch(() => setContractors([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1" onClick={() => navigate(`/projects/${projectId}/contractors`)}>
          <Plus className="h-4 w-4" /> Add Contractor
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>
      ) : contractors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HardHat className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No contractors on this project yet</p>
            <Button size="sm" className="mt-4" onClick={() => navigate(`/projects/${projectId}/contractors`)}>Add Contractor</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contractors.map(c => {
            const daysLeft = daysUntil(c.contractEndDate);
            const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 14;

            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{c.companyName}</h3>
                      </div>
                      <p className="text-xs text-gray-500">{c.code} · {c.specialization}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${CONTRACTOR_STATUS_COLORS[c.status] || ''}`}>
                      {CONTRACTOR_STATUS_LABELS[c.status] || c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <span><span className="text-gray-400">Admin:</span> {c.contractorAdminName || '—'}</span>
                    <span><span className="text-gray-400">Dept:</span> {c.departmentName || '—'}</span>
                    <span><span className="text-gray-400">Start:</span> {formatDate(c.contractStartDate)}</span>
                    <span className={isExpiringSoon ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
                      <span className="text-gray-400">End:</span> {formatDate(c.contractEndDate)}
                      {isExpiringSoon && ` (${daysLeft}d)`}
                    </span>
                  </div>

                  {c.contractValue && (
                    <p className="text-sm font-semibold text-primary-600 mb-3">
                      {formatCurrency(c.contractValue, c.currency)}
                    </p>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1"
                    onClick={() => navigate(`/projects/${projectId}/contractors`)}
                  >
                    <ExternalLink className="h-3 w-3" /> View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DEPARTMENTS TAB ─────────────────────────────────────────────────────────
function DepartmentsTab({ projectId, navigate }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentService.getByProject(projectId)
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-1" onClick={() => navigate(`/projects/${projectId}/departments`)}>
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No departments yet</p>
            <Button size="sm" className="mt-4" onClick={() => navigate(`/projects/${projectId}/departments`)}>Add Department</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map(d => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{d.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{d.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.isOutsourced && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        Outsourced
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {d.status || 'Active'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {d.supervisorName && <p><span className="text-gray-400">Supervisor:</span> {d.supervisorName}</p>}
                  {d.specialization && <p><span className="text-gray-400">Specialty:</span> {d.specialization}</p>}
                  {d.contractorName && <p><span className="text-gray-400">Contractor:</span> {d.contractorName}</p>}
                  {d.startDate && <p><span className="text-gray-400">Started:</span> {formatDate(d.startDate)}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MEMBERS TAB ─────────────────────────────────────────────────────────────
const CONTRACT_TYPE_COLORS = {
  FullTime:   'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  PartTime:   'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
  Contract:   'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  Freelance:  'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  Internship: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200',
};

function MemberAvatar({ name, imageUrl, size = 'md' }) {
  const initials = (name || '??').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const sz = size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  return imageUrl ? (
    <img src={imageUrl} alt={name} className={`${sz} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 flex-shrink-0`} />
  ) : (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-semibold text-white flex-shrink-0 ring-2 ring-white dark:ring-gray-800`}>
      {initials}
    </div>
  );
}

function MembersTab({ projectId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);

  const fetchMembers = async (searchTerm = '') => {
    setLoading(true);
    try {
      const params = { pageSize: 100 };
      if (searchTerm) params.searchTerm = searchTerm;
      if (activeFilter !== '') params.isActive = activeFilter === 'active';
      const res = await api.get(`/projects/${projectId}/members`, { params });
      const data = res.data?.data || res.data || {};
      setMembers(data.members || []);
      setTotalMembers(data.totalMembers || 0);
      setActiveMembers(data.activeMembers || 0);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(search); }, [projectId, activeFilter]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') fetchMembers(search);
  };

  // Unique department options from loaded members
  const deptOptions = [...new Set(members.filter(m => m.departmentName).map(m => m.departmentName))].sort();

  // Client-side dept filter (already searched server-side)
  const displayed = deptFilter
    ? members.filter(m => m.departmentName === deptFilter)
    : members;

  return (
    <div className="space-y-5">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total Members" value={totalMembers} icon={Users} color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-900/20" />
        <StatCard label="Active"        value={activeMembers} icon={CheckCircle} color="text-green-600" bg="bg-green-50 dark:bg-green-900/20" />
        <StatCard label="Inactive"      value={totalMembers - activeMembers} icon={AlertCircle} color="text-gray-600" bg="bg-gray-100 dark:bg-gray-700/40" />
      </div>

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, role… (Enter)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {deptOptions.length > 0 && (
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Departments</option>
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No members found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(m => (
            <Card key={m.workInfoId} className={`hover:shadow-md transition-shadow overflow-hidden ${!m.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="pt-5 pb-4">
                {/* Header Row */}
                <div className="flex items-start gap-3 mb-3">
                  <MemberAvatar name={m.fullName} imageUrl={m.profileImageUrl} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">{m.fullName}</h3>
                      {!m.isActive && (
                        <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.email}</p>
                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-0.5 truncate">{m.position}</p>
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                  {m.departmentName && (
                    <div className="flex items-center gap-2">
                      <Layers className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{m.departmentName}</span>
                    </div>
                  )}
                  {m.contractorName && (
                    <div className="flex items-center gap-2">
                      <HardHat className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{m.contractorName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    <span>Joined {formatDate(m.startDate)}</span>
                    {m.endDate && <span className="text-gray-400">→ {formatDate(m.endDate)}</span>}
                  </div>
                  {m.employeeId && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="font-mono">{m.employeeId}</span>
                    </div>
                  )}
                </div>

                {/* Footer Tags */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {m.contractType && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTRACT_TYPE_COLORS[m.contractType] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {m.contractType}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {m.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Count footer */}
      {!loading && displayed.length > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Showing {displayed.length} of {totalMembers} member{totalMembers !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const ProjectManagement = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [project,     setProject]     = useState(null);
  const [tasks,       setTasks]       = useState([]);
  const [milestones,  setMilestones]  = useState([]);
  const [contractors, setContractors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (tab) => setSearchParams({ tab });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [projRes, tasksRes, msRes, cRes, dRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`, { params: { pageSize: 100, includeSubtasks: false } }),
          milestoneService.getByProject(projectId).catch(() => []),
          contractorService.getByProject(projectId).catch(() => []),
          departmentService.getByProject(projectId).catch(() => []),
        ]);

        const p = projRes.data?.data || projRes.data;
        if (!p) { setError('Project not found'); return; }

        setProject(p);
        setTasks(tasksRes.data?.data?.tasks || tasksRes.data?.tasks || []);
        setMilestones(Array.isArray(msRes) ? msRes : []);
        setContractors(Array.isArray(cRes) ? cRes : []);
        setDepartments(Array.isArray(dRes) ? dRes : []);
      } catch (err) {
        const status = err.response?.status;
        setError(
          status === 404 ? 'Project not found.' :
          status === 403 ? 'You do not have permission to view this project.' :
          err.response?.data?.message || 'Failed to load project'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-3 text-primary-600" />
          <p className="text-sm text-gray-500">Loading project…</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card className="text-center py-12">
          <CardContent>
            <AlertCircle className="h-14 w-14 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
              <Button onClick={() => navigate('/projects')}>All Projects</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectStatusColor = {
    Active:   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    Planning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    OnHold:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    Completed:'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  }[project?.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 pt-6 pb-0">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 dark:text-white">{project?.name}</span>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{project?.name}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${projectStatusColor}`}>{project?.status}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{project?.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{project?.projectType}</span>
                {project?.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>}
                <span className="font-mono">{project?.code}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1 flex-shrink-0" onClick={() => {}}>
              <Edit2 className="h-4 w-4" /> Edit
            </Button>
          </div>

          {/* Tab Nav */}
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'tasks'       && tasks.length > 0       && <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{tasks.length}</span>}
                  {tab.id === 'milestones'  && milestones.length > 0  && <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{milestones.length}</span>}
                  {tab.id === 'contractors' && contractors.length > 0 && <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{contractors.length}</span>}
                  {tab.id === 'departments' && departments.length > 0 && <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full">{departments.length}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'overview'    && <OverviewTab project={project} tasks={tasks} milestones={milestones} contractors={contractors} departments={departments} />}
        {activeTab === 'tasks'       && <TasksTab projectId={projectId} navigate={navigate} />}
        {activeTab === 'milestones'  && <MilestonesTab projectId={projectId} navigate={navigate} />}
        {activeTab === 'contractors' && <ContractorsTab projectId={projectId} navigate={navigate} />}
        {activeTab === 'departments' && <DepartmentsTab projectId={projectId} navigate={navigate} />}
        {activeTab === 'members'     && <MembersTab projectId={projectId} />}
      </div>
    </div>
  );
};
