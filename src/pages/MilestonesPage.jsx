import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { milestoneService, MILESTONE_STATUS_COLORS, MILESTONE_STATUS_LABELS } from '../services/milestoneService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Flag, Plus, ChevronRight, Loader, AlertCircle, CheckCircle, Calendar, TrendingUp,
} from 'lucide-react';

const schema = z.object({
  title:       z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  dueDate:     z.string().min(1, 'Due date is required'),
  orderIndex:  z.coerce.number().int().min(1).optional(),
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const color = pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : pct >= 30 ? 'bg-yellow-500' : 'bg-gray-400';
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function MilestonesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project,    setProject]    = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [completing, setCompleting] = useState(null);
  const [error,      setError]      = useState('');
  const [formError,  setFormError]  = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { orderIndex: 1 },
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, msData] = await Promise.all([
        api.get(`/projects/${projectId}`),
        milestoneService.getByProject(projectId),
      ]);
      setProject(projRes.data?.data || projRes.data);
      setMilestones(Array.isArray(msData) ? msData : []);
    } catch {
      setError('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const onSubmit = async (values) => {
    setSaving(true);
    setFormError('');
    try {
      await milestoneService.create({ ...values, projectId });
      reset();
      setModalOpen(false);
      fetchAll();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create milestone');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id) => {
    setCompleting(id);
    try {
      await milestoneService.complete(id);
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed', progress: 100, completedAt: new Date().toISOString() } : m));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to complete milestone');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-7 w-7 animate-spin text-primary-600" />
      </div>
    );
  }

  const total     = milestones.length;
  const completed = milestones.filter(m => m.status === 'Completed').length;
  const overdue   = milestones.filter(m => m.status !== 'Completed' && new Date(m.dueDate) < new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project?.name || 'Project'}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 dark:text-white">Milestones</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Flag className="h-6 w-6 text-primary-600" /> Milestones
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{project?.name}</p>
            </div>
            <Button className="gap-1" onClick={() => { reset(); setModalOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Milestone
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400"><span className="font-bold text-gray-900 dark:text-white">{total}</span> total</span>
            <span className="text-green-600"><span className="font-bold">{completed}</span> completed</span>
            {overdue > 0 && <span className="text-red-600"><span className="font-bold">{overdue}</span> overdue</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {milestones.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Flag className="h-14 w-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No milestones yet</h3>
              <p className="text-sm text-gray-500 mb-6">Define key checkpoints for this project to track major progress stages.</p>
              <Button onClick={() => setModalOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Add First Milestone</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary-300 to-gray-200 dark:from-primary-700 dark:to-gray-700" />
            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const days = Math.ceil((new Date(m.dueDate) - new Date()) / 86400000);
                const isOverdue = m.status !== 'Completed' && days < 0;

                return (
                  <div key={m.id} className="flex gap-4">
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-md ${
                      m.status === 'Completed' ? 'bg-green-500' :
                      m.status === 'InProgress' ? 'bg-blue-500' :
                      isOverdue ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-600'
                    }`}>
                      {m.status === 'Completed' ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                    </div>

                    <Card className="flex-1">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{m.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MILESTONE_STATUS_COLORS[m.status] || ''}`}>
                                {MILESTONE_STATUS_LABELS[m.status] || m.status}
                              </span>
                              {isOverdue && <span className="text-xs font-semibold text-red-600 dark:text-red-400">OVERDUE {Math.abs(days)}d</span>}
                            </div>
                            {m.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{m.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due {formatDate(m.dueDate)}</span>
                              {m.completedAt && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle className="h-3 w-3" /> Completed {formatDate(m.completedAt)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span><span className="font-medium">{Math.round(m.progress || 0)}%</span>
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
                              {completing === m.id
                                ? <Loader className="h-3 w-3 animate-spin" />
                                : <><CheckCircle className="h-3 w-3 mr-1" /> Complete</>
                              }
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

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Add Milestone">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{formError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input {...register('title')} placeholder="e.g. Foundation Complete"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea {...register('description')} rows={3} placeholder="What does completing this milestone mean?"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label>
              <input type="date" {...register('dueDate')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.dueDate && <p className="text-xs text-red-600 mt-1">{errors.dueDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
              <input type="number" min="1" {...register('orderIndex')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <><Loader className="h-4 w-4 animate-spin mr-2" /> Saving…</> : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
