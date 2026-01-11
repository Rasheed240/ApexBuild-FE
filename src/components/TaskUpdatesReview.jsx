import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, AlertCircle, Clock, User, CheckCircle, XCircle,
  ChevronRight, Loader, ThumbsUp, ThumbsDown, FileText,
  CheckSquare, Activity,
} from 'lucide-react';
import { taskService, UPDATE_STATUS } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import { useOrganizations } from '../contexts/OrganizationContext';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const fmt = (date) => {
  if (!date) return '';
  const ms = Date.now() - new Date(date).getTime();
  const m = Math.floor(ms / 60000);
  const h = Math.floor(ms / 3600000);
  const d = Math.floor(ms / 86400000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return d === 1 ? 'yesterday' : `${d}d ago`;
};

const STATUS_META = {
  [UPDATE_STATUS.Submitted]:                  { label: 'Submitted',                color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',            bar: 'border-l-gray-400'   },
  [UPDATE_STATUS.UnderContractorAdminReview]: { label: 'Awaiting Contractor Admin', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', bar: 'border-l-purple-400' },
  [UPDATE_STATUS.ContractorAdminApproved]:    { label: 'CA Approved',              color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',           bar: 'border-l-blue-300'   },
  [UPDATE_STATUS.ContractorAdminRejected]:    { label: 'CA Rejected',              color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',              bar: 'border-l-red-400'    },
  [UPDATE_STATUS.UnderSupervisorReview]:      { label: 'Awaiting Supervisor',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',          bar: 'border-l-blue-400'   },
  [UPDATE_STATUS.SupervisorApproved]:         { label: 'Supervisor Approved',      color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300',           bar: 'border-l-cyan-400'   },
  [UPDATE_STATUS.SupervisorRejected]:         { label: 'Supervisor Rejected',      color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',              bar: 'border-l-red-400'    },
  [UPDATE_STATUS.UnderAdminReview]:           { label: 'Awaiting Admin',           color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',  bar: 'border-l-orange-400' },
  [UPDATE_STATUS.AdminApproved]:              { label: 'Fully Approved',           color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',       bar: 'border-l-green-400'  },
  [UPDATE_STATUS.AdminRejected]:              { label: 'Admin Rejected',           color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',              bar: 'border-l-red-400'    },
};

const PENDING_STATUSES  = [UPDATE_STATUS.UnderContractorAdminReview, UPDATE_STATUS.UnderSupervisorReview, UPDATE_STATUS.UnderAdminReview];
const REJECTED_STATUSES = [UPDATE_STATUS.ContractorAdminRejected, UPDATE_STATUS.SupervisorRejected, UPDATE_STATUS.AdminRejected];

function MediaThumb({ url, type, index }) {
  const [broken, setBroken] = useState(false);
  if (type === 'image' && !broken) {
    return (
      <img src={url} alt={`media-${index}`}
        className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
        onError={() => setBroken(true)} />
    );
  }
  if (type === 'video') return <video src={url} className="h-16 w-16 rounded-lg object-cover" />;
  if (type === 'audio') return <audio src={url} controls className="w-40 h-8 mt-1" />;
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2.5 py-1.5 rounded-lg hover:underline">
      <FileText className="h-3 w-3" /> File {index + 1}
    </a>
  );
}

export default function TaskUpdatesReview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedOrganization } = useOrganizations();

  const [updates,    setUpdates]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [reviewing,  setReviewing]  = useState(null);
  const [feedback,   setFeedback]   = useState('');
  const [error,      setError]      = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);

  // Derive role category from user context
  const myRole = (() => {
    const names = (user?.roles || []).map(r => (typeof r === 'object' ? r.roleName || r.name : r));
    if (names.some(n => ['SuperAdmin','PlatformAdmin','ProjectOwner','ProjectAdministrator'].includes(n))) return 'admin';
    if (names.includes('DepartmentSupervisor')) return 'supervisor';
    if (names.includes('ContractorAdmin'))      return 'contractorAdmin';
    return 'fieldWorker';
  })();

  const isFieldWorker = myRole === 'fieldWorker';

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { pageNumber: page, pageSize: 20 };
      if (selectedOrganization?.id) params.organizationId = selectedOrganization.id;
      const data  = await taskService.getPendingUpdates(params);
      const list  = data?.items || data?.Items || (Array.isArray(data) ? data : []);
      setUpdates(list);
      setTotal(data?.totalCount ?? data?.TotalCount ?? list.length);
    } catch {
      setError('Failed to load updates. Please try again.');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedOrganization]);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  const handleReview = async (update, approved) => {
    const type = update.status === UPDATE_STATUS.UnderContractorAdminReview ? 'contractorAdmin'
               : update.status === UPDATE_STATUS.UnderSupervisorReview      ? 'supervisor'
               : 'admin';
    setError('');
    try {
      if      (type === 'contractorAdmin') await taskService.reviewByContractorAdmin(update.id, approved, feedback.trim());
      else if (type === 'supervisor')      await taskService.reviewBySupervisor(update.id, approved, feedback.trim());
      else                                 await taskService.reviewByAdmin(update.id, approved, feedback.trim());
      setReviewing(null);
      setFeedback('');
      fetchUpdates();
    } catch (e) {
      setError(e.response?.data?.message || 'Review failed. Try again.');
    }
  };

  const displayed = updates.filter(u => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (u.taskTitle || '').toLowerCase().includes(q)
        || (u.taskCode  || '').toLowerCase().includes(q)
        || (u.submittedByName || '').toLowerCase().includes(q);
  });

  const pendingCount = updates.filter(u => PENDING_STATUSES.includes(u.status)).length;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isFieldWorker ? 'My Progress Updates' : 'Task Update Reviews'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {loading ? 'Loading…'
            : isFieldWorker
            ? `${updates.length} update${updates.length !== 1 ? 's' : ''} submitted`
            : `${pendingCount} update${pendingCount !== 1 ? 's' : ''} awaiting your review`}
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by task name, code or submitter…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-7 w-7 animate-spin text-primary-600" /></div>
      ) : displayed.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            {isFieldWorker
              ? <Activity className="h-14 w-14 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              : <CheckCircle className="h-14 w-14 mx-auto mb-3 text-green-400" />}
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {isFieldWorker ? 'No updates submitted yet' : 'All caught up!'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isFieldWorker
                ? "Open a task you're assigned to and submit a progress update."
                : 'No pending reviews at the moment.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map(update => {
            const meta      = STATUS_META[update.status] ?? { label: update.statusLabel || 'Unknown', color: 'bg-gray-100 text-gray-700', bar: 'border-l-gray-400' };
            const isPending = PENDING_STATUSES.includes(update.status);
            const isRejected = REJECTED_STATUSES.includes(update.status);
            const isApproved = update.status === UPDATE_STATUS.AdminApproved;
            // FieldWorkers NEVER see the Review button
            const canReview = !isFieldWorker && isPending;

            return (
              <Card key={update.id} className={`border-l-4 ${meta.bar} hover:shadow-md transition-shadow`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">

                      {/* Title + code */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isApproved  && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        {isRejected  && <XCircle     className="h-4 w-4 text-red-500 flex-shrink-0"   />}
                        {isPending   && <Clock       className="h-4 w-4 text-yellow-500 flex-shrink-0"/>}
                        {!isPending && !isRejected && !isApproved
                          && <Activity className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {update.taskTitle || 'Task Update'}
                        </span>
                        {update.taskCode && (
                          <span className="text-xs font-mono text-gray-400">{update.taskCode}</span>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 ${meta.color}`}>
                        {meta.label}
                      </span>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {update.description}
                      </p>

                      {/* Media */}
                      {update.mediaUrls?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {update.mediaUrls.map((url, i) => (
                            <MediaThumb key={i} url={url} type={update.mediaTypes?.[i] || 'image'} index={i} />
                          ))}
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {!isFieldWorker && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> {update.submittedByName || '—'}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {fmt(update.submittedAt)}
                        </span>
                        <span>Progress: <span className="font-semibold text-primary-600 dark:text-primary-400">{update.progressPercentage ?? 0}%</span></span>
                        {update.projectName && <span className="text-gray-400">{update.projectName}</span>}
                      </div>

                      {/* Feedback trail — FieldWorkers see why something was rejected */}
                      {isFieldWorker && (isRejected || isApproved) && (
                        <div className="mt-3 space-y-1.5 border-t border-gray-100 dark:border-gray-700 pt-3">
                          {update.contractorAdminFeedback && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Contractor Admin:</span> {update.contractorAdminFeedback}
                            </p>
                          )}
                          {update.supervisorFeedback && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Supervisor:</span> {update.supervisorFeedback}
                            </p>
                          )}
                          {update.adminFeedback && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Admin:</span> {update.adminFeedback}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Inline review form — only for reviewer roles */}
                      {canReview && reviewing === update.id && (
                        <div className="mt-3 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                          <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Feedback (optional)…"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleReview(update, true)}>
                              <ThumbsUp className="h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline"
                              className="flex-1 gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleReview(update, false)}>
                              <ThumbsDown className="h-3 w-3" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost"
                              onClick={() => { setReviewing(null); setFeedback(''); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap"
                        onClick={() => navigate(`/tasks/${update.taskId}?tab=updates`)}>
                        View Task <ChevronRight className="h-3 w-3" />
                      </Button>
                      {canReview && reviewing !== update.id && (
                        <Button size="sm" className="whitespace-nowrap gap-1"
                          onClick={() => { setReviewing(update.id); setFeedback(''); }}>
                          <CheckSquare className="h-3 w-3" />
                          {update.status === UPDATE_STATUS.UnderContractorAdminReview ? 'Review'
                            : update.status === UPDATE_STATUS.UnderSupervisorReview   ? 'Review'
                            : 'Review'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {total > 20 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {page}</span>
          <Button variant="outline" size="sm" disabled={updates.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
