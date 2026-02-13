import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, AlertCircle, Clock, User, CheckCircle, XCircle, HardHat, Users, ChevronRight, Loader, ThumbsUp, ThumbsDown } from 'lucide-react';
import { taskService, UPDATE_STATUS, UPDATE_STATUS_LABELS } from '../services/taskService';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const formatTimeAgo = (date) => {
  if (!date) return '';
  const diffMs   = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1)  return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24)  return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
};

const STEP_META = {
  [UPDATE_STATUS.UnderContractorAdminReview]: { label: 'Awaiting Contractor Admin', icon: HardHat,     color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800' },
  [UPDATE_STATUS.UnderSupervisorReview]:      { label: 'Awaiting Supervisor',        icon: Users,       color: 'bg-blue-50   border-blue-200   text-blue-700   dark:bg-blue-900/20   dark:border-blue-800'   },
  [UPDATE_STATUS.UnderAdminReview]:           { label: 'Awaiting Admin',             icon: CheckCircle, color: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800' },
  [UPDATE_STATUS.AdminApproved]:              { label: 'Fully Approved',             icon: CheckCircle, color: 'bg-green-50  border-green-200  text-green-700  dark:bg-green-900/20  dark:border-green-800'  },
  [UPDATE_STATUS.ContractorAdminRejected]:    { label: 'CA Rejected',                icon: XCircle,     color: 'bg-red-50    border-red-200    text-red-700    dark:bg-red-900/20    dark:border-red-800'    },
  [UPDATE_STATUS.SupervisorRejected]:         { label: 'Supervisor Rejected',        icon: XCircle,     color: 'bg-red-50    border-red-200    text-red-700    dark:bg-red-900/20    dark:border-red-800'    },
  [UPDATE_STATUS.AdminRejected]:              { label: 'Admin Rejected',             icon: XCircle,     color: 'bg-red-50    border-red-200    text-red-700    dark:bg-red-900/20    dark:border-red-800'    },
};

export default function TaskUpdatesReview() {
  const navigate = useNavigate();
  const [updates,    setUpdates]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [reviewing,  setReviewing]  = useState(null);
  const [feedback,   setFeedback]   = useState('');
  const [error,      setError]      = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUpdates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await taskService.getPendingUpdates({
        pageNumber: page,
        pageSize: 20,
        searchTerm: searchTerm || undefined,
        filterByStatus: statusFilter || undefined,
      });
      const list = data?.updates || data?.Updates || (Array.isArray(data) ? data : []);
      setUpdates(list);
      setTotal(data?.totalCount ?? data?.TotalCount ?? list.length);
    } catch {
      setError('Failed to load pending reviews');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUpdates(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchUpdates(); }
  };

  const handleReview = async (update, approved) => {
    const type = update.status === UPDATE_STATUS.UnderContractorAdminReview ? 'contractorAdmin'
               : update.status === UPDATE_STATUS.UnderSupervisorReview      ? 'supervisor'
               : 'admin';
    setError('');
    try {
      if      (type === 'contractorAdmin') await taskService.reviewByContractorAdmin(update.id, approved, feedback.trim());
      else if (type === 'supervisor')      await taskService.reviewBySupervisor(update.id, approved, feedback.trim());
      else                                 await taskService.reviewByAdmin(update.id, approved, feedback.trim());
      setReviewing(null); setFeedback('');
      fetchUpdates();
    } catch (e) {
      setError(e.response?.data?.message || 'Review failed. Try again.');
    }
  };

  const pendingStatuses = [
    UPDATE_STATUS.UnderContractorAdminReview,
    UPDATE_STATUS.UnderSupervisorReview,
    UPDATE_STATUS.UnderAdminReview,
  ];
  const pendingCount = updates.filter(u => pendingStatuses.includes(u.status)).length;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Update Reviews</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {loading ? 'Loading…' : `${pendingCount} update${pendingCount !== 1 ? 's' : ''} awaiting your review`}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search task or user… (Enter)"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Pending</option>
              <option value={UPDATE_STATUS.UnderContractorAdminReview}>Contractor Admin Review</option>
              <option value={UPDATE_STATUS.UnderSupervisorReview}>Supervisor Review</option>
              <option value={UPDATE_STATUS.UnderAdminReview}>Admin Review</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Updates List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader className="h-7 w-7 animate-spin text-primary-600" /></div>
      ) : updates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="h-14 w-14 mx-auto mb-3 text-green-400" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-500">No pending reviews at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map(update => {
            const meta   = STEP_META[update.status] || { label: UPDATE_STATUS_LABELS[update.status] || 'Review', icon: Clock, color: 'border-gray-200' };
            const Icon   = meta.icon;
            const isPending = pendingStatuses.includes(update.status);

            return (
              <Card key={update.id} className={`border-l-4 ${meta.color.includes('purple') ? 'border-l-purple-400' : meta.color.includes('blue') ? 'border-l-blue-400' : meta.color.includes('orange') ? 'border-l-orange-400' : meta.color.includes('green') ? 'border-l-green-400' : 'border-l-red-400'} hover:shadow-md transition-shadow`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Task title + status */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 dark:text-white">{update.taskTitle || update.TaskTitle || 'Task Update'}</span>
                        <span className="text-xs font-mono text-gray-400">{update.taskCode || update.TaskCode}</span>
                      </div>

                      {/* Stage badge */}
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mb-2 ${meta.color}`}>
                        {meta.label}
                      </span>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                        {update.description || update.Description}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {update.submittedByUserName || update.submittedBy?.name || '—'}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTimeAgo(update.submittedAt || update.SubmittedAt)}</span>
                        <span>Progress: <span className="font-semibold text-primary-600">{update.progressPercentage ?? update.ProgressPercentage ?? 0}%</span></span>
                        {(update.mediaUrls || update.media)?.length > 0 && (
                          <span>📎 {(update.mediaUrls || update.media).length} file{(update.mediaUrls || update.media).length !== 1 ? 's' : ''}</span>
                        )}
                      </div>

                      {/* Inline review */}
                      {isPending && reviewing === update.id && (
                        <div className="mt-3 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                          <textarea
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            placeholder="Feedback (optional)…"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleReview(update, true)}>
                              <ThumbsUp className="h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleReview(update, false)}>
                              <ThumbsDown className="h-3 w-3" /> Reject
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setReviewing(null); setFeedback(''); }}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 whitespace-nowrap"
                        onClick={() => navigate(`/tasks/${update.taskId}`)}
                      >
                        View <ChevronRight className="h-3 w-3" />
                      </Button>
                      {isPending && (
                        <Button
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => { setReviewing(update.id); setFeedback(''); }}
                        >
                          Review
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

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page}</span>
          <Button variant="outline" size="sm" disabled={updates.length < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
