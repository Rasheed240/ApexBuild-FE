import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { departmentService } from '../services/departmentService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Layers, Plus, ChevronRight, Loader, AlertCircle, Users, Building2,
  Calendar, CheckCircle, HardHat,
} from 'lucide-react';

const schema = z.object({
  name:           z.string().min(2, 'Name is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  supervisorId:   z.string().uuid('Select a supervisor').optional().or(z.literal('')),
  isOutsourced:   z.boolean().optional(),
  startDate:      z.string().optional(),
  description:    z.string().optional(),
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export function DepartmentsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project,     setProject]     = useState(null);
  const [departments, setDepartments] = useState([]);
  const [projectUsers,setProjectUsers]= useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');
  const [formError,   setFormError]   = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { isOutsourced: false },
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, dData, puRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        departmentService.getByProject(projectId),
        api.get(`/projects/${projectId}/members`).catch(() => ({ data: { data: [] } })),
      ]);
      setProject(projRes.data?.data || projRes.data);
      setDepartments(Array.isArray(dData) ? dData : []);
      setProjectUsers(puRes.data?.data?.members || puRes.data?.members || []);
    } catch {
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const onSubmit = async (values) => {
    setSaving(true);
    setFormError('');
    try {
      await departmentService.create({ ...values, projectId, supervisorId: values.supervisorId || null });
      reset();
      setModalOpen(false);
      fetchAll();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-7 w-7 animate-spin text-primary-600" />
      </div>
    );
  }

  const active     = departments.filter(d => d.isActive).length;
  const outsourced = departments.filter(d => d.isOutsourced).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project?.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 dark:text-white">Departments</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="h-6 w-6 text-primary-600" /> Departments
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{project?.name}</p>
            </div>
            <Button className="gap-1" onClick={() => { reset(); setModalOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400"><span className="font-bold text-gray-900 dark:text-white">{departments.length}</span> total</span>
            <span className="text-green-600"><span className="font-bold">{active}</span> active</span>
            {outsourced > 0 && <span className="text-purple-600"><span className="font-bold">{outsourced}</span> outsourced</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {departments.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Layers className="h-14 w-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No departments yet</h3>
              <p className="text-sm text-gray-500 mb-6">Create departments to organize the work on this project by specialty or trade.</p>
              <Button onClick={() => setModalOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Add First Department</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(d => (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{d.name}</h3>
                        {d.isOutsourced && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <HardHat className="h-3 w-3" /> Outsourced
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{d.code}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${d.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {d.status || 'Active'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-20 flex-shrink-0">Specialty</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{d.specialization || '—'}</span>
                    </div>
                    {d.supervisorName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20 flex-shrink-0">Supervisor</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Users className="h-3 w-3" /> {d.supervisorName}
                        </span>
                      </div>
                    )}
                    {d.contractorName && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20 flex-shrink-0">Contractor</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <HardHat className="h-3 w-3" /> {d.contractorName}
                        </span>
                      </div>
                    )}
                    {d.startDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-20 flex-shrink-0">Started</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(d.startDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  {d.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{d.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Add Department">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{formError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name *</label>
            <input {...register('name')} placeholder="e.g. Structural Engineering"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization *</label>
            <input {...register('specialization')} placeholder="e.g. Electrical, Plumbing, Civil Engineering"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.specialization && <p className="text-xs text-red-600 mt-1">{errors.specialization.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor</label>
            <select {...register('supervisorId')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">None</option>
              {projectUsers.map(u => <option key={u.userId} value={u.userId}>{u.userName} ({u.roleName})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" {...register('startDate')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isOutsourced" {...register('isOutsourced')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="isOutsourced" className="text-sm font-medium text-gray-700 dark:text-gray-300">Outsourced</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea {...register('description')} rows={2} placeholder="Brief description of this department's scope"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <><Loader className="h-4 w-4 animate-spin mr-2" /> Saving…</> : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
