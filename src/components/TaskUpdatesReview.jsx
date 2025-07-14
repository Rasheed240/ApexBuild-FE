import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, Search, AlertCircle, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import TaskUpdateDetail from './TaskUpdateDetail';

export default function TaskUpdatesReview() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 20,
    status: null,
    projectId: null,
    departmentId: null,
    searchTerm: ''
  });

  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 20,
    totalPages: 1
  });

  useEffect(() => {
    fetchPendingReviews();
  }, [filters]);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      const api = (await import('../services/api')).default;
      const response = await api.get('/projects/tasks/updates/pending', {
        params: {
          pageNumber: filters.pageNumber,
          pageSize: filters.pageSize,
          ...(filters.status && { filterByStatus: filters.status }),
          ...(filters.projectId && { filterByProjectId: filters.projectId }),
          ...(filters.departmentId && { filterByDepartmentId: filters.departmentId }),
          ...(filters.searchTerm && { searchTerm: filters.searchTerm })
        }
      });

      const result = response.data?.data ?? response.data;
      const updates = result.updates ?? result.Updates ?? [];
      setUpdates(updates);
      setPagination({
        totalCount: result.totalCount ?? result.TotalCount ?? 0,
        pageNumber: result.pageNumber ?? result.PageNumber ?? 1,
        pageSize: result.pageSize ?? result.PageSize ?? 20,
        totalPages: result.totalPages ?? result.TotalPages ?? 1
      });
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      setUpdates([]);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    // Handle both string and numeric status values
    const statusValue = typeof status === 'number' ? status : status;

    // Map numeric or string status to colors
    switch (statusValue) {
      case 2: // UnderSupervisorReview
      case 'UnderSupervisorReview':
        return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800';
      case 5: // UnderAdminReview
      case 'UnderAdminReview':
        return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800';
      case 3: // SupervisorApproved
      case 'SupervisorApproved':
        return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800';
      case 4: // SupervisorRejected
      case 'SupervisorRejected':
        return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800';
      case 1: // Submitted
      case 'Submitted':
        return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-700';
      case 6: // AdminApproved
      case 'AdminApproved':
        return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800';
      case 7: // AdminRejected
      case 'AdminRejected':
        return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/20 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    const statusValue = typeof status === 'number' ? status : status;

    switch (statusValue) {
      case 2: // UnderSupervisorReview
      case 5: // UnderAdminReview
      case 'UnderSupervisorReview':
      case 'UnderAdminReview':
        return <Clock className="w-4 h-4" />;
      case 3: // SupervisorApproved
      case 6: // AdminApproved
      case 'SupervisorApproved':
      case 'AdminApproved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 4: // SupervisorRejected
      case 7: // AdminRejected
      case 'SupervisorRejected':
      case 'AdminRejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleQuickReview = async (updateId, action) => {
    try {
      const api = (await import('../services/api')).default;
      await api.post(`/projects/tasks/updates/${updateId}/review`, {
        action: action,
        reviewNotes: ''
      });
      // Refresh list
      await fetchPendingReviews();
    } catch (error) {
      console.error('Error reviewing update:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Update Reviews</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pagination.totalCount} pending {pagination.totalCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          <span className="font-semibold">Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Task, project, or user..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value, pageNumber: 1 })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || null, pageNumber: 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="UnderSupervisorReview">Pending Supervisor</option>
              <option value="UnderAdminReview">Pending Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Updates List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
          </div>
        </div>
      ) : updates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All caught up!</h3>
          <p className="text-gray-600 dark:text-gray-400">No pending reviews at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => (
            <div
              key={update.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${getStatusColor(update.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(update.status)}
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {update.taskTitle}
                    </h3>
                    <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                      {update.taskCode}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {update.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{update.submittedBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(update.submittedAt)}</span>
                    </div>
                    <div>
                      Progress: <span className="font-semibold">{update.progressPercentage}%</span>
                    </div>
                    {update.media.length > 0 && (
                      <div className="flex items-center gap-1">
                        📎 <span>{update.media.length} {update.media.length === 1 ? 'file' : 'files'}</span>
                      </div>
                    )}
                    {update.commentCount > 0 && (
                      <div>💬 <span className="font-semibold">{update.commentCount} comments</span></div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 space-y-2">
                  <button
                    onClick={() => { setSelectedUpdate(update); setShowDetail(true); }}
                    className="w-32 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setFilters({ ...filters, pageNumber: filters.pageNumber - 1 })}
            disabled={pagination.pageNumber === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.pageNumber} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, pageNumber: filters.pageNumber + 1 })}
            disabled={pagination.pageNumber === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedUpdate && (
        <TaskUpdateDetail
          update={selectedUpdate}
          onClose={() => setShowDetail(false)}
          onReviewComplete={() => {
            setShowDetail(false);
            fetchPendingReviews();
          }}
        />
      )}
    </div>
  );
}
