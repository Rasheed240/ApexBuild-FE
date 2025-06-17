import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  User,
  Users,
  Folder,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Paperclip,
  Upload,
  TrendingUp,
  Edit,
  MessageSquare,
  CheckSquare,
  MoreVertical,
  Plus, // Added missing import
  Edit2,
  Activity,
  Layers,
} from 'lucide-react';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import api from '../services/api';
import { uploadTaskMedia } from '../services/mediaService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { MediaGallery } from '../components/ui/MediaGallery';
import { ProfilePicture } from '../components/ui/ProfilePicture';

export function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [task, setTask] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

  useEffect(() => {
    setActiveTab('overview'); // Reset to overview tab when task changes
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/tasks/${taskId}`);
      const taskData = res.data?.data || res.data;
      setTask(taskData);

      // Fetch subtasks if this is a parent task, otherwise clear subtasks
      if (taskData && !taskData.parentTaskId) {
        const subtasksRes = await api.get(`/tasks/${taskId}/subtasks`);
        const subtasksData = subtasksRes.data?.data?.tasks || subtasksRes.data?.tasks || [];
        setSubtasks(Array.isArray(subtasksData) ? subtasksData : []);
      } else {
        setSubtasks([]);
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = async (file, mediaType) => {
    try {
      setUploadingMedia(true);
      setError('');

      const result = await uploadTaskMedia(taskId, file, mediaType);

      // Update task with new media URL
      setTask(prev => {
        const updated = { ...prev };
        if (mediaType === 'image') {
          updated.imageUrls = [...(updated.imageUrls || []), result.url];
        } else if (mediaType === 'video') {
          updated.videoUrls = [...(updated.videoUrls || []), result.url];
        } else if (mediaType === 'document') {
          updated.attachmentUrls = [...(updated.attachmentUrls || []), result.url];
        }
        return updated;
      });
    } catch (err) {
      console.error('Error uploading media:', err);
      setError(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploadingMedia(false);
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      0: 'default', 1: 'default', 2: 'info', 3: 'info',
      4: 'warning', 5: 'danger', 6: 'success',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      0: 'Pending', 1: 'Not Started', 2: 'In Progress',
      3: 'Under Review', 4: 'On Hold', 5: 'Cancelled', 6: 'Completed',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
    return labels[priority] || priority;
  };

  const getPriorityVariant = (priority) => {
    const map = { 1: 'default', 2: 'info', 3: 'warning', 4: 'danger' };
    return map[priority] || 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading task..." />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto mb-6 text-red-500 dark:text-red-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Error Loading Task
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate(-1)}>Go Back</Button>
                <Button onClick={() => navigate('/tasks')}>View All Tasks</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const heroImage = task?.imageUrls?.[0] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  const isGradient = heroImage.startsWith('linear-gradient');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative h-80 overflow-hidden">
        {isGradient ? (
          <div className="absolute inset-0" style={{ background: heroImage }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900" />
          </div>
        ) : (
          <>
            <img
              src={heroImage}
              alt={task?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-gray-50 dark:to-gray-900" />
          </>
        )}

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/90 mb-4">
              <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/my-tasks" className="hover:text-white">My Tasks</Link>
              {task?.parentTaskId && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link to={`/tasks/${task.parentTaskId}`} className="hover:text-white">
                    Parent Task
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{task?.code}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {task?.title || task?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={getStatusVariant(task?.status)} className="text-base">
                    {getStatusLabel(task?.status)}
                  </Badge>
                  {task?.priority && (
                    <Badge variant={getPriorityVariant(task?.priority)}>
                      {getPriorityLabel(task?.priority)} Priority
                    </Badge>
                  )}
                  {task?.code && (
                    <Badge variant="outline" className="backdrop-blur-sm bg-white/20 text-white border-white/30">
                      {task.code}
                    </Badge>
                  )}
                </div>
              </div>
              <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          {['overview', 'media', 'subtasks', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium capitalize transition-all ${activeTab === tab
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {task?.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Progress */}
                {task?.progress != null && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {task.progress}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <>
                {/* Images */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Images
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingMedia}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingMedia ? 'Uploading...' : 'Upload'}
                      </Button>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(file, 'image');
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.imageUrls && task.imageUrls.length > 0 ? (
                      <MediaGallery items={task.imageUrls} columns={3} />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No images uploaded
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Videos */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Videos
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => videoInputRef.current?.click()}
                        disabled={uploadingMedia}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(file, 'video');
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.videoUrls && task.videoUrls.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {task.videoUrls.map((url, index) => (
                          <video key={index} src={url} controls className="w-full rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No videos uploaded
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Paperclip className="h-5 w-5" />
                        Attachments
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => docInputRef.current?.click()}
                        disabled={uploadingMedia}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <input
                        ref={docInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleMediaUpload(file, 'document');
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.attachmentUrls && task.attachmentUrls.length > 0 ? (
                      <div className="space-y-2">
                        {task.attachmentUrls.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Document {index + 1}
                              </span>
                            </div>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 text-sm font-medium"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No attachments uploaded
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Subtasks Tab */}
            {activeTab === 'subtasks' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Subtasks ({subtasks.length})
                    </CardTitle>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                      onClick={() => setIsSubtaskModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Subtask
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subtasks.length > 0 ? (
                    <div className="space-y-3">
                      {subtasks.map((subtask) => (
                        <Link
                          key={subtask.id}
                          to={`/tasks/${subtask.id}`}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                {subtask.title}
                              </h4>
                              <Badge variant={getStatusVariant(subtask.status)} size="sm">
                                {getStatusLabel(subtask.status)}
                              </Badge>
                            </div>
                            {subtask.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                {subtask.description}
                              </p>
                            )}
                          </div>
                          {subtask.progress != null && (
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600"
                                  style={{ width: `${subtask.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {subtask.progress}%
                              </span>
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No subtasks yet
                      </p>
                      <Button size="sm" variant="outline" onClick={() => setIsSubtaskModalOpen(true)}>
                        Create First Subtask
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Activity timeline coming soon
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task?.departmentName && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                      Department
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white font-medium">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{task.departmentName}</span>
                    </div>
                  </div>
                )}

                {task?.assignees && task.assignees.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                      Assigned To ({task.assignees.length})
                    </label>
                    <div className="space-y-2">
                      {task.assignees.map((assignee) => (
                        <div key={assignee.userId} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <ProfilePicture
                            src={assignee.userProfileImage}
                            alt={assignee.userName}
                            size="sm"
                          />
                          <div className="flex-1">
                            <span className="text-gray-900 dark:text-white font-medium block">
                              {assignee.userName}
                            </span>
                            {assignee.role && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {assignee.role}
                              </span>
                            )}
                          </div>
                          {assignee.isActive && (
                            <Badge variant="success" className="text-xs">Active</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task?.startDate && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                      Start Date
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(task.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {task?.dueDate && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                      Due Date
                    </label>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {task?.estimatedHours && (
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400 block mb-1">
                      Estimated Hours
                    </label>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {task.estimatedHours}h
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No comments yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>
      {/* Modals */}
      <TaskFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        taskToEdit={task}
        onSuccess={fetchTaskDetails}
      />

      <TaskFormModal
        isOpen={isSubtaskModalOpen}
        onClose={() => setIsSubtaskModalOpen(false)}
        parentTask={task}
        onSuccess={fetchTaskDetails}
      />
    </div>
  );
}
