import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { taskService } from '../services/taskService';
import { departmentService } from '../services/departmentService';
import api from '../services/api';
import {
  ChevronLeft, Plus, Loader, AlertCircle, Calendar, Target, Flag,
  Clock, MapPin, Tag, X, CheckCircle2, Users, Search, CheckCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  priority: z.string().default('1'),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.string().optional(),
  location: z.string().optional(),
});

const PRIORITY_OPTIONS = [
  { value: '1', label: 'Low',      color: 'text-gray-500'   },
  { value: '2', label: 'Medium',   color: 'text-blue-500'   },
  { value: '3', label: 'High',     color: 'text-orange-500' },
  { value: '4', label: 'Critical', color: 'text-red-500'    },
];

const inputCls = (hasError) =>
  `w-full px-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-gray-800 text-gray-900 dark:text-white
   placeholder-gray-400 dark:placeholder-gray-500 outline-none transition
   ${hasError
     ? 'border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20'
     : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 hover:border-gray-400 dark:hover:border-gray-500'
   }`;

const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

export const TaskCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [members, setMembers] = useState([]);
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: '2' },
  });

  const watchedDeptId = watch('departmentId');

  // Load projects for the dropdown
  useEffect(() => {
    api.get('/projects', { params: { pageSize: 200 } })
      .then(r => {
        const data = r.data?.data || r.data || {};
        setProjects(data.projects || data.Projects || []);
      })
      .catch(() => setProjects([]));
  }, []);

  // Load departments when project is selected
  useEffect(() => {
    if (!selectedProjectId) { setDepartments([]); setMembers([]); return; }
    departmentService.getByProject(selectedProjectId)
      .then(data => setDepartments(Array.isArray(data) ? data : []))
      .catch(() => setDepartments([]));
  }, [selectedProjectId]);

  // Load members when project or department changes
  const fetchMembers = useCallback(async (pid, deptId) => {
    if (!pid) { setMembers([]); return; }
    try {
      const params = { isActive: true, pageSize: 200 };
      if (deptId) params.departmentId = deptId;
      const res = await api.get(`/projects/${pid}/members`, { params });
      const data = res.data?.data ?? res.data;
      setMembers(data?.members ?? []);
    } catch { setMembers([]); }
  }, []);

  useEffect(() => {
    fetchMembers(selectedProjectId, watchedDeptId || null);
    setSelectedAssignees([]);
  }, [selectedProjectId, watchedDeptId]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const filteredMembers = members.filter(m =>
    !memberSearch ||
    m.fullName?.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.email?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const allSelected = filteredMembers.length > 0 && filteredMembers.every(m => selectedAssignees.includes(m.userId));

  const toggleAssignee = (userId) =>
    setSelectedAssignees(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);

  const toggleSelectAll = () => {
    if (allSelected) {
      const ids = new Set(filteredMembers.map(m => m.userId));
      setSelectedAssignees(prev => prev.filter(id => !ids.has(id)));
    } else {
      setSelectedAssignees(prev => [...new Set([...prev, ...filteredMembers.map(m => m.userId)])]);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSubmitting(true);
    try {
      await taskService.createTask({
        title: data.title,
        description: data.description || '',
        departmentId: data.departmentId,
        priority: parseInt(data.priority),
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        estimatedHours: data.estimatedHours ? parseInt(data.estimatedHours) : 0,
        location: data.location || null,
        tags: tags.length ? tags : null,
        assignedUserIds: selectedAssignees,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Task Created!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your task has been successfully created.</p>
          <div className="flex gap-3 justify-center">
            {selectedProjectId && (
              <Button onClick={() => navigate(`/projects/${selectedProjectId}?tab=tasks`)}>
                View Project Tasks
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/tasks')}>All Tasks</Button>
            <Button variant="ghost" onClick={() => { setSuccess(false); setTags([]); }}>Create Another</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <span>/</span>
        {selectedProjectId && (
          <>
            <Link to={`/projects/${selectedProjectId}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Project
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 dark:text-white font-medium">New Task</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          Create New Task
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-11">Fill in the details below to create a new project task.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <Card>
          <CardContent className="pt-5 pb-5 space-y-4">
            <div>
              <Label required>Task Title</Label>
              <input
                {...register('title')}
                placeholder="e.g. Install electrical conduits on Floor 3"
                className={inputCls(errors.title)}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe what needs to be done…"
                className={inputCls(false) + ' resize-none'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Flag className="h-4 w-4 text-primary-500" /> Assignment</CardTitle></CardHeader>
          <CardContent className="pb-5 space-y-4">
            {/* Project (if not pre-filled) */}
            <div>
              <Label required>Project</Label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className={inputCls(false)}
              >
                <option value="">Select a project…</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <Label required>Department</Label>
              <select
                {...register('departmentId')}
                disabled={!selectedProjectId || departments.length === 0}
                className={inputCls(errors.departmentId)}
              >
                <option value="">
                  {!selectedProjectId ? 'Select a project first' : departments.length === 0 ? 'No departments found' : 'Select a department…'}
                </option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.departmentId && <p className="text-xs text-red-500 mt-1">{errors.departmentId.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Assign To */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary-500" /> Assign To
                {watchedDeptId && <span className="text-xs text-gray-400 font-normal">(filtered by dept)</span>}
              </CardTitle>
              {filteredMembers.length > 0 && (
                <button type="button" onClick={toggleSelectAll}
                  className="text-xs flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" />
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-5">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                placeholder="Search members…"
                className={inputCls(false) + ' pl-9 text-sm'} />
            </div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {!selectedProjectId ? (
                <p className="text-sm text-gray-400 p-4 text-center">Select a project first</p>
              ) : filteredMembers.length === 0 ? (
                <p className="text-sm text-gray-400 p-4 text-center">
                  {watchedDeptId ? 'No members in this department' : 'No project members found'}
                </p>
              ) : filteredMembers.map(m => (
                <label key={m.userId} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedAssignees.includes(m.userId)} onChange={() => toggleAssignee(m.userId)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {m.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.fullName}</p>
                    {m.position && <p className="text-xs text-gray-500 truncate">{m.position}</p>}
                  </div>
                </label>
              ))}
            </div>
            {selectedAssignees.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {selectedAssignees.length} assignee{selectedAssignees.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-primary-500" /> Scheduling & Details</CardTitle></CardHeader>
          <CardContent className="pb-5 space-y-4">
            <div>
              <Label required>Priority</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRIORITY_OPTIONS.map(opt => {
                  const isChecked = false; // controlled by register
                  return (
                    <label
                      key={opt.value}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border-2 cursor-pointer transition-all text-xs font-semibold
                        ${opt.color}`}
                    >
                      <input
                        {...register('priority')}
                        type="radio"
                        value={opt.value}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input type="date" {...register('startDate')} className={inputCls(false) + ' pl-9'} />
                </div>
              </div>
              <div>
                <Label>Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input type="date" {...register('dueDate')} className={inputCls(false) + ' pl-9'} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Estimated Hours</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    {...register('estimatedHours')}
                    placeholder="0"
                    className={inputCls(false) + ' pl-9'}
                  />
                </div>
              </div>
              <div>
                <Label>Location / Zone</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    {...register('location')}
                    placeholder="e.g. Block B, Floor 2"
                    className={inputCls(false) + ' pl-9'}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Tag className="h-4 w-4 text-primary-500" /> Tags</CardTitle></CardHeader>
          <CardContent className="pb-5">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter…"
                className={inputCls(false) + ' flex-1'}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="gap-1">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-2 pb-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="flex-1 gap-2">
            {submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {submitting ? 'Creating…' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};
