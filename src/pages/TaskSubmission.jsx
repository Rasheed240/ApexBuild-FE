import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/taskService';
import { uploadTaskMedia } from '../services/mediaService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { ImageUpload } from '../components/ui/ImageUpload';
import { MediaGallery } from '../components/ui/MediaGallery';
import {
  Send,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const TaskSubmission = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    summary: '',
    progressPercentage: 0,
    mediaUrls: [],
    mediaTypes: [],
  });

  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskById(taskId);
      setTask(response);
      setFormData((prev) => ({
        ...prev,
        progressPercentage: response.progress || 0,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (files) => {
    try {
      setUploadingMedia(true);
      setError('');

      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await uploadTaskMedia(file);
        return {
          url: result.url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
        };
      });

      const uploaded = await Promise.all(uploadPromises);

      setFormData((prev) => ({
        ...prev,
        mediaUrls: [...prev.mediaUrls, ...uploaded.map((u) => u.url)],
        mediaTypes: [...prev.mediaTypes, ...uploaded.map((u) => u.type)],
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleRemoveMedia = (index) => {
    setFormData((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
      mediaTypes: prev.mediaTypes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.description.trim()) {
      setError('Please provide a description of your work');
      return;
    }

    try {
      setSubmitting(true);
      await taskService.submitTaskUpdate(taskId, {
        description: formData.description,
        summary: formData.summary,
        progressPercentage: parseFloat(formData.progressPercentage),
        mediaUrls: formData.mediaUrls,
        mediaTypes: formData.mediaTypes,
      });

      setSuccess('Work submitted successfully! It will be reviewed by your supervisor.');
      setTimeout(() => {
        navigate('/my-tasks');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit work');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Task Not Found</h2>
        <Button onClick={() => navigate('/my-tasks')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/my-tasks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Work</h1>
          <p className="text-gray-600 dark:text-gray-400">{task.title}</p>
        </div>
      </div>

      {success && (
        <Alert variant="success" onClose={() => setSuccess('')}>
          <CheckCircle className="h-5 w-5" />
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          <AlertCircle className="h-5 w-5" />
          {error}
        </Alert>
      )}

      {/* Task Info */}
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Department:</span>
              <p className="font-medium text-gray-900 dark:text-white">{task.departmentName}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Current Progress:</span>
              <p className="font-medium text-gray-900 dark:text-white">{task.progress}%</p>
            </div>
            {task.dueDate && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <p className="font-medium text-gray-900 dark:text-white">{task.status}</p>
            </div>
          </div>
          {task.description && (
            <div className="mt-4">
              <span className="text-gray-600 dark:text-gray-400">Description:</span>
              <p className="mt-1 text-gray-900 dark:text-white">{task.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Work Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Describe the work you've completed in detail..."
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide details about what you've accomplished, challenges faced, and results achieved
              </p>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary (Optional)
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Brief summary of your work..."
              />
            </div>

            {/* Progress Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Progress: {formData.progressPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progressPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, progressPercentage: e.target.value })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attach Photos/Videos
              </label>
              <ImageUpload
                onUpload={handleMediaUpload}
                multiple
                accept="image/*,video/*"
                uploading={uploadingMedia}
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload photos or videos showing your work progress
              </p>
            </div>

            {/* Media Gallery */}
            {formData.mediaUrls.length > 0 && (
              <MediaGallery
                mediaUrls={formData.mediaUrls}
                mediaTypes={formData.mediaTypes}
                onRemove={handleRemoveMedia}
                editable
              />
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/my-tasks')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!formData.description.trim() || submitting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Work
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
