import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { contractorService, CONTRACTOR_STATUS_COLORS, CONTRACTOR_STATUS_LABELS } from '../services/contractorService';
import { departmentService } from '../services/departmentService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  HardHat, Plus, ChevronRight, Loader, AlertCircle, Calendar, DollarSign,
  Users, Briefcase, Phone, Mail, ExternalLink, Edit2, Trash2, CheckCircle,
} from 'lucide-react';

const schema = z.object({
  companyName:       z.string().min(2, 'Company name is required'),
  specialization:    z.string().min(2, 'Specialization is required'),
  contractorAdminId: z.string().uuid('Select a valid contractor admin'),
  departmentId:      z.string().uuid().optional().or(z.literal('')),
  contractStartDate: z.string().min(1, 'Start date is required'),
  contractEndDate:   z.string().min(1, 'End date is required'),
  contractValue:     z.coerce.number().positive().optional(),
  currency:          z.string().optional(),
  registrationNumber:z.string().optional(),
  description:       z.string().optional(),
});

const formatDate   = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const formatAmount = (a, c = 'NGN') => a ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(a) : '—';
const daysUntil    = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

export function ContractorsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project,     setProject]     = useState(null);
  const [contractors, setContractors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projectUsers,setProjectUsers]= useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [selected,    setSelected]    = useState(null); // for detail view
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(null);
  const [error,       setError]       = useState('');
  const [formError,   setFormError]   = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'NGN' },
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [projRes, cData, dData, puRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        contractorService.getByProject(projectId),
        departmentService.getByProject(projectId),
        api.get(`/projects/${projectId}/members`).catch(() => ({ data: { data: [] } })),
      ]);
      setProject(projRes.data?.data || projRes.data);
      setContractors(Array.isArray(cData) ? cData : []);
      setDepartments(Array.isArray(dData) ? dData : []);
      setProjectUsers(puRes.data?.data?.members || puRes.data?.members || []);
    } catch {
      setError('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [projectId]);

  const onSubmit = async (values) => {
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...values,
        projectId,
        departmentId: values.departmentId || null,
        contractValue: values.contractValue || null,
      };
      await contractorService.create(payload);
      reset();
      setModalOpen(false);
      fetchAll();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create contractor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this contractor from the project?')) return;
    setDeleting(id);
    try {
      await contractorService.delete(id);
      setContractors(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove contractor');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-7 w-7 animate-spin text-primary-600" />
      </div>
    );
  }

  const activeCount   = contractors.filter(c => c.status === 'Active').length;
  const totalValue    = contractors.reduce((s, c) => s + (c.contractValue || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link to="/projects" className="hover:text-primary-600">Projects</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project?.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 dark:text-white">Contractors</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HardHat className="h-6 w-6 text-primary-600" /> Contractors
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{project?.name}</p>
            </div>
            <Button className="gap-1" onClick={() => { reset(); setModalOpen(true); }}>
              <Plus className="h-4 w-4" /> Add Contractor
            </Button>
          </div>

          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400"><span className="font-bold text-gray-900 dark:text-white">{contractors.length}</span> total</span>
            <span className="text-green-600"><span className="font-bold">{activeCount}</span> active</span>
            {totalValue > 0 && <span className="text-primary-600"><span className="font-bold">{formatAmount(totalValue)}</span> total contract value</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {contractors.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <HardHat className="h-14 w-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No contractors yet</h3>
              <p className="text-sm text-gray-500 mb-6">Add contractor companies to outsource specialized work on this project.</p>
              <Button onClick={() => setModalOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Add First Contractor</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {contractors.map(c => {
              const daysLeft = daysUntil(c.contractEndDate);
              const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 14;
              const isExpired      = daysLeft !== null && daysLeft < 0;

              return (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{c.companyName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{c.code} · {c.specialization}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${CONTRACTOR_STATUS_COLORS[c.status] || ''}`}>
                        {CONTRACTOR_STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Admin</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{c.contractorAdminName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Department</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{c.departmentName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" /> Start</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(c.contractStartDate)}</p>
                      </div>
                      <div>
                        <p className={`text-xs mb-0.5 flex items-center gap-1 ${isExpiringSoon ? 'text-orange-500' : isExpired ? 'text-red-500' : 'text-gray-400'}`}>
                          <Calendar className="h-3 w-3" /> End {isExpiringSoon && `(${daysLeft}d left)`}{isExpired && `(${Math.abs(daysLeft)}d ago)`}
                        </p>
                        <p className={`font-medium ${isExpiringSoon ? 'text-orange-600 dark:text-orange-400' : isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {formatDate(c.contractEndDate)}
                        </p>
                      </div>
                    </div>

                    {c.contractValue && (
                      <div className="mb-4 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><DollarSign className="h-3 w-3" /> Contract Value</p>
                        <p className="font-bold text-primary-600 text-base">{formatAmount(c.contractValue, c.currency)}</p>
                      </div>
                    )}

                    {c.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{c.description}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setSelected(c)}
                      >
                        <ExternalLink className="h-3 w-3" /> Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleting === c.id}
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {deleting === c.id ? <Loader className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Side Panel Modal */}
      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected.companyName}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-gray-400 text-xs mb-0.5">Code</p><p className="font-medium">{selected.code}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Status</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONTRACTOR_STATUS_COLORS[selected.status] || ''}`}>{CONTRACTOR_STATUS_LABELS[selected.status]}</span>
              </div>
              <div><p className="text-gray-400 text-xs mb-0.5">Specialization</p><p className="font-medium">{selected.specialization}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Admin</p><p className="font-medium">{selected.contractorAdminName || '—'}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Contract Start</p><p className="font-medium">{formatDate(selected.contractStartDate)}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Contract End</p><p className="font-medium">{formatDate(selected.contractEndDate)}</p></div>
              {selected.registrationNumber && <div><p className="text-gray-400 text-xs mb-0.5">Reg. No.</p><p className="font-medium">{selected.registrationNumber}</p></div>}
              {selected.contractNumber && <div><p className="text-gray-400 text-xs mb-0.5">Contract No.</p><p className="font-medium">{selected.contractNumber}</p></div>}
            </div>
            {selected.contractValue && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-400 mb-0.5">Contract Value</p>
                <p className="font-bold text-primary-600 text-lg">{formatAmount(selected.contractValue, selected.currency)}</p>
              </div>
            )}
            {selected.description && (
              <div><p className="text-xs text-gray-400 mb-1">Description</p><p className="text-gray-700 dark:text-gray-300">{selected.description}</p></div>
            )}
            {selected.members && selected.members.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> Team Members ({selected.members.length})</p>
                <div className="space-y-1.5">
                  {selected.members.map(m => (
                    <div key={m.userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{m.userName}</span>
                      <span className="text-xs text-gray-500">{m.position}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Add Contractor">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{formError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
            <input {...register('companyName')} placeholder="e.g. FastWire Electricals Ltd"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization *</label>
            <input {...register('specialization')} placeholder="e.g. Electrical, Plumbing, Road Construction"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            {errors.specialization && <p className="text-xs text-red-600 mt-1">{errors.specialization.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contractor Admin *</label>
            <select {...register('contractorAdminId')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Select admin user…</option>
              {projectUsers.map(u => (
                <option key={u.userId} value={u.userId}>{u.userName} ({u.roleName})</option>
              ))}
            </select>
            {errors.contractorAdminId && <p className="text-xs text-red-600 mt-1">{errors.contractorAdminId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
            <select {...register('departmentId')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">None</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Start *</label>
              <input type="date" {...register('contractStartDate')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.contractStartDate && <p className="text-xs text-red-600 mt-1">{errors.contractStartDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract End *</label>
              <input type="date" {...register('contractEndDate')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              {errors.contractEndDate && <p className="text-xs text-red-600 mt-1">{errors.contractEndDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Value</label>
              <input type="number" step="1" {...register('contractValue')} placeholder="e.g. 45000000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select {...register('currency')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea {...register('description')} rows={2} placeholder="Brief description of scope of work"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? <><Loader className="h-4 w-4 animate-spin mr-2" /> Saving…</> : 'Add Contractor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
