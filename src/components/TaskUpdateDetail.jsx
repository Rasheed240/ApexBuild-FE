import React, { useState } from 'react';
import { X, Download, ExternalLink, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TaskUpdateDetail({ update, onClose, onReviewComplete }) {
  const [activeAction, setActiveAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [adjustedProgress, setAdjustedProgress] = useState(update.progressPercentage);
  const [enableProgressAdjustment, setEnableProgressAdjustment] = useState(false);

  // Helper to convert status enum to readable string
  const getStatusText = (status) => {
    const statusMap = {
      1: 'Submitted',
      2: 'Under Supervisor Review',
      3: 'Supervisor Approved',
      4: 'Supervisor Rejected',
      5: 'Under Admin Review',
      6: 'Admin Approved',
      7: 'Admin Rejected'
    };

    // If status is already a string, format it
    if (typeof status === 'string') {
      return status.replace(/([A-Z])/g, ' $1').trim();
    }

    // If status is a number, use the map
    return statusMap[status] || 'Unknown';
  };

  const handleReview = async (action) => {
    if (!reviewNotes.trim() && action === 'reject') {
      alert('Please provide feedback for rejection');
      return;
    }

    setSubmitting(true);
    try {
      const api = (await import('../services/api')).default;
      const payload = {
        action: action,
        reviewNotes: reviewNotes
      };

      // Include adjusted progress only if it was changed
      if (enableProgressAdjustment && adjustedProgress !== update.progressPercentage) {
        payload.adjustedProgressPercentage = adjustedProgress;
      }

      await api.post(`/projects/tasks/updates/${update.id}/review`, payload);

      alert(`Task update ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      onReviewComplete();
    } catch (error) {
      console.error('Error reviewing update:', error);
      alert(error.response?.data?.message || 'Error reviewing update');
    } finally {
      setSubmitting(false);
    }
  };

  const getMediaIcon = (mediaType) => {
    if (mediaType.includes('image')) return '🖼️';
    if (mediaType.includes('video')) return '🎥';
    return '📄';
  };

  const currentMedia = update.media[currentMediaIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {update.taskTitle}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Task Code: <span className="font-mono">{update.taskCode}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Project</p>
              <p className="font-semibold text-gray-900 dark:text-white">{update.projectName}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Department</p>
              <p className="font-semibold text-gray-900 dark:text-white">{update.departmentName}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Progress</p>
              <p className="font-semibold text-gray-900 dark:text-white">{update.progressPercentage}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="font-semibold text-blue-600">{getStatusText(update.status)}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{update.progressPercentage}% complete</p>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${update.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Update Description</h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">
              {update.description}
            </p>
          </div>

          {/* Submitted By */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-semibold">Submitted by:</span> {update.submittedBy.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {update.submittedBy.email} • {update.submittedBy.roleName}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {new Date(update.submittedAt).toLocaleString()}
            </p>
          </div>

          {/* Media Gallery */}
          {update.media.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Attachments ({update.media.length})
              </h3>
              
              {/* Current Media Display */}
              {currentMedia && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-3">
                  {currentMedia.mediaType.includes('image') && (
                    <img
                      src={currentMedia.url}
                      alt={currentMedia.fileName}
                      className="w-full h-96 object-contain"
                    />
                  )}
                  {currentMedia.mediaType.includes('video') && (
                    <video
                      src={currentMedia.url}
                      controls
                      className="w-full h-96"
                    />
                  )}
                </div>
              )}

              {/* Media Navigation */}
              {update.media.length > 1 && (
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setCurrentMediaIndex(Math.max(0, currentMediaIndex - 1))}
                    disabled={currentMediaIndex === 0}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentMediaIndex + 1} of {update.media.length}
                  </span>
                  <button
                    onClick={() => setCurrentMediaIndex(Math.min(update.media.length - 1, currentMediaIndex + 1))}
                    disabled={currentMediaIndex === update.media.length - 1}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Media List */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {update.media.map((media, idx) => (
                  <button
                    key={media.id}
                    onClick={() => setCurrentMediaIndex(idx)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      idx === currentMediaIndex
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{getMediaIcon(media.mediaType)}</div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-2">
                      {media.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(media.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Review Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Your Review</h3>

            {/* Progress Adjustment */}
            <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={enableProgressAdjustment}
                    onChange={(e) => setEnableProgressAdjustment(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  Adjust Progress Percentage
                </label>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {enableProgressAdjustment ? adjustedProgress : update.progressPercentage}%
                </span>
              </div>

              {enableProgressAdjustment && (
                <div className="mt-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={adjustedProgress}
                    onChange={(e) => setAdjustedProgress(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                  {adjustedProgress !== update.progressPercentage && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      Original: {update.progressPercentage}% → Adjusted: {adjustedProgress}%
                    </p>
                  )}
                </div>
              )}
            </div>

            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add feedback or approval notes (required for rejection)..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleReview('reject')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
              <button
                onClick={() => handleReview('approve')}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
