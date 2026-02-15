import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, User, Users, Folder, ChevronRight, AlertCircle, CheckCircle,
  Clock, FileText, Image as ImageIcon, Video, Paperclip, Upload, TrendingUp,
  Edit2, MessageSquare, CheckSquare, Plus, Activity, Layers, Mic, Flag,
  HardHat, XCircle, ThumbsUp, ThumbsDown, Send, Loader,
} from 'lucide-react';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import api from '../services/api';
import { taskService, UPDATE_STATUS, UPDATE_STATUS_LABELS, TASK_STATUS_LABELS } from '../services/taskService';
import { uploadTaskMedia } from '../services/mediaService';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { MediaGallery } from '../components/ui/MediaGallery';
import { ProfilePicture } from '../components/ui/ProfilePicture';

const TASK_STATUS_COLORS = {
  NotStarted: 'bg-gray-100 text-gray-700',
  InProgress:  'bg-blue-100 text-blue-700',
  UnderReview: 'bg-yellow-100 text-yellow-700',
  OnHold:      'bg-orange-100 text-orange-700',
  Approved:    'bg-teal-100 text-teal-700',
  Completed:   'bg-green-100 text-green-700',
  Rejected:    'bg-red-100 text-red-700',
  Cancelled:   'bg-gray-100 text-gray-500',
};

const formatDate = (d) => d ? new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const formatShort = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ─── Review Chain Status Card ─────────────────────────────────────────────────
function ReviewChainCard({ update }) {
  const s = update.status;
  const isContracted = update.contractorAdminApproved !== undefined;

  const steps = [
    {
      label: 'Field Worker',
      sublabel: update.submittedByUserName,
      done: true,
      approved: true,
      date: update.submittedAt,
      icon: User,
    },
    ...(isContracted ? [{
      label: 'Contractor Admin',
      sublabel: update.reviewedByContractorAdminName,
      done: s >= UPDATE_STATUS.ContractorAdminApproved || s === UPDATE_STATUS.ContractorAdminRejected,
      approved: update.contractorAdminApproved,
      date: update.contractorAdminReviewedAt,
      feedback: update.contractorAdminFeedback,
      icon: HardHat,
    }] : []),
    {
      label: 'Supervisor',
      sublabel: update.reviewedBySupervisorName,
      done: s >= UPDATE_STATUS.SupervisorApproved || s === UPDATE_STATUS.SupervisorRejected,
      approved: update.supervisorApproved,
      date: update.supervisorReviewedAt,
      feedback: update.supervisorFeedback,
      icon: Users,
    },
    {
      label: 'Project Admin',
      sublabel: update.reviewedByAdminName,
      done: s >= UPDATE_STATUS.AdminApproved || s === UPDATE_STATUS.AdminRejected,
      approved: update.adminApproved,
      date: update.adminReviewedAt,
      feedback: update.adminFeedback,
      icon: CheckSquare,
    },
  ];

  return (
    <div className="flex items-start gap-2 mt-4">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = !step.done && idx > 0 && steps[idx - 1].done && steps[idx - 1].approved !== false;

        return (
          <div key={idx} className="flex-1">
            {idx > 0 && (
              <div className={`h-0.5 mb-3 ${steps[idx - 1].done && steps[idx - 1].approved !== false ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
            <div className={`p-2.5 rounded-lg border text-xs ${
              step.done && step.approved !== false
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : step.done && step.approved === false
                ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                : isActive
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <Icon className="h-3 w-3 flex-shrink-0" />
                <span className="font-semibold truncate">{step.label}</span>
              </div>
              {step.sublabel && <p className="text-gray-500 truncate">{step.sublabel}</p>}
              {step.done && (
                <>
                  <div className="flex items-center gap-1 mt-1">
                    {step.approved !== false
                      ? <CheckCircle className="h-3 w-3 text-green-600" />
                      : <XCircle className="h-3 w-3 text-red-600" />
                    }
                    <span className={step.approved !== false ? 'text-green-600' : 'text-red-600'}>
                      {step.approved !== false ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                  {step.feedback && <p className="text-gray-500 italic mt-1 line-clamp-2">"{step.feedback}"</p>}
                </>
              )}
              {isActive && <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">Pending review</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Updates Tab ─────────────────────────────────────────────────────────────
function UpdatesTab({ taskId, task }) {
  const { user } = useAuth();
  const [updates,  setUpdates]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error,    setError]    = useState('');

  useEffect(() => {
    taskService.getTaskUpdates(taskId)
      .then(data => setUpdates(Array.isArray(data) ? data : data?.updates || []))
      .catch(() => setUpdates([]))
      .finally(() => setLoading(false));
  }, [taskId]);

  const handleReview = async (updateId, type, approved) => {
    setError('');
    const feedbackText = feedback.trim();
    try {
      if (type === 'contractorAdmin') await taskService.reviewByContractorAdmin(updateId, approved, feedbackText);
      else if (type === 'supervisor')   await taskService.reviewBySupervisor(updateId, approved, feedbackText);
      else                              await taskService.reviewByAdmin(updateId, approved, feedbackText);

      setUpdates(prev => prev.map(u => u.id === updateId ? {
        ...u,
        status: approved
          ? (type === 'contractorAdmin' ? UPDATE_STATUS.ContractorAdminApproved : type === 'supervisor' ? UPDATE_STATUS.SupervisorApproved : UPDATE_STATUS.AdminApproved)
          : (type === 'contractorAdmin' ? UPDATE_STATUS.ContractorAdminRejected : type === 'supervisor' ? UPDATE_STATUS.SupervisorRejected : UPDATE_STATUS.AdminRejected),
      } : u));
      setReviewing(null);
      setFeedback('');
    } catch (e) {
      setError(e.response?.data?.message || 'Review failed');
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300">{error}</div>}

      {updates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No progress updates yet</p>
          </CardContent>
        </Card>
      ) : (
        updates.map(u => {
          const statusLabel = UPDATE_STATUS_LABELS[u.status] || u.status;
          const isSubmitted      = u.status === UPDATE_STATUS.Submitted;
          const isUnderCA        = u.status === UPDATE_STATUS.UnderContractorAdminReview;
          const isUnderSupervisor= u.status === UPDATE_STATUS.UnderSupervisorReview;
          const isUnderAdmin     = u.status === UPDATE_STATUS.UnderAdminReview;
          const isFullyApproved  = u.status === UPDATE_STATUS.AdminApproved;

          const canReviewAsCA    = isUnderCA;
          const canReviewAsSup   = isUnderSupervisor;
          const canReviewAsAdmin = isUnderAdmin;

          return (
            <Card key={u.id}>
              <CardContent className="pt-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{u.submittedByUserName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{formatDate(u.submittedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary-600">{u.progressPercentage}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isFullyApproved ? 'bg-green-100 text-green-700' :
                      u.status >= UPDATE_STATUS.ContractorAdminRejected && u.status <= UPDATE_STATUS.AdminRejected && (u.status === 4 || u.status === 7 || u.status === 10) ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{u.description}</p>

                {/* Media */}
                {u.mediaUrls && u.mediaUrls.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {u.mediaUrls.map((url, i) => {
                        const type = u.mediaTypes?.[i] || 'image';
                        if (type === 'image') return <img key={i} src={url} alt="" className="h-24 w-24 object-cover rounded-lg" />;
                        if (type === 'video') return <video key={i} src={url} className="h-24 w-24 rounded-lg" controls />;
                        if (type === 'audio') return <audio key={i} src={url} controls className="w-full" />;
                        return <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-primary-600 underline"><Paperclip className="h-3 w-3" /> Document {i + 1}</a>;
                      })}
                    </div>
                  </div>
                )}

                {/* Review Chain */}
                <ReviewChainCard update={u} />

                {/* Review Panel */}
                {(canReviewAsCA || canReviewAsSup || canReviewAsAdmin) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {reviewing === u.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                          placeholder="Feedback (optional)…"
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleReview(u.id, canReviewAsCA ? 'contractorAdmin' : canReviewAsSup ? 'supervisor' : 'admin', true)}>
                            <ThumbsUp className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 gap-1 text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleReview(u.id, canReviewAsCA ? 'contractorAdmin' : canReviewAsSup ? 'supervisor' : 'admin', false)}>
                            <ThumbsDown className="h-3 w-3" /> Reject
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setReviewing(null); setFeedback(''); }}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full gap-1" onClick={() => setReviewing(u.id)}>
                        <CheckSquare className="h-3 w-3" />
                        {canReviewAsCA ? 'Review as Contractor Admin' : canReviewAsSup ? 'Review as Supervisor' : 'Review as Admin'}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}

// ─── Comments Tab ─────────────────────────────────────────────────────────────
function CommentsTab({ taskId }) {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);

  const fetchComments = () => {
    taskService.getTaskComments(taskId)
      .then(data => setComments(Array.isArray(data) ? data : data?.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComments(); }, [taskId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await taskService.addTaskComment(taskId, text.trim());
      setText('');
      fetchComments();
    } catch { }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-4">
      {/* Comment input */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
          />
          <div className="flex justify-end">
            <Button size="sm" disabled={!text.trim() || sending} onClick={handleSend} className="gap-1">
              {sending ? <Loader className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-8 flex justify-center"><Loader className="h-5 w-5 animate-spin text-primary-600" /></div>
      ) : comments.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-gray-500 dark:text-gray-400 text-sm">No comments yet</CardContent></Card>
      ) : (
        comments.map(c => (
          <div key={c.id} className="flex gap-3">
            <ProfilePicture src={c.userProfileImage} alt={c.userName} size="sm" />
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{c.userName}</span>
                <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{c.comment}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function TaskDetail() {
  const { taskId } = useParams();
  const navigate   = useNavigate();
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const docInputRef   = useRef(null);
  const audioInputRef = useRef(null);

  const [task,          setTask]          = useState(null);
  const [subtasks,      setSubtasks]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [uploadingMedia,setUploadingMedia]= useState(false);
  const [error,         setError]         = useState('');
  const [activeTab,     setActiveTab]     = useState('overview');
  const [isEditModalOpen,    setIsEditModalOpen]    = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true); setError('');
      const res  = await api.get(`/tasks/${taskId}`);
      const data = res.data?.data || res.data;
      setTask(data);
      if (data && !data.parentTaskId) {
        const subRes = await api.get(`/tasks/${taskId}/subtasks`);
        setSubtasks(subRes.data?.data?.tasks || subRes.data?.tasks || []);
      } else {
        setSubtasks([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setActiveTab('overview'); fetchTaskDetails(); }, [taskId]);

  const handleMediaUpload = async (file, mediaType) => {
    try {
      setUploadingMedia(true); setError('');
      const result = await uploadTaskMedia(taskId, file, mediaType);
      setTask(prev => {
        const updated = { ...prev };
        if      (mediaType === 'image')    updated.imageUrls      = [...(updated.imageUrls      || []), result.url];
        else if (mediaType === 'video')    updated.videoUrls      = [...(updated.videoUrls      || []), result.url];
        else if (mediaType === 'audio')    updated.audioUrls      = [...(updated.audioUrls      || []), result.url];
        else if (mediaType === 'document') updated.attachmentUrls = [...(updated.attachmentUrls || []), result.url];
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" text="Loading task…" /></div>;

  if (error && !task) {
    return (
      <div className="min-h-screen p-8">
        <Card className="max-w-lg mx-auto text-center py-12">
          <CardContent>
            <AlertCircle className="h-14 w-14 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Task</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const heroImage  = task?.imageUrls?.[0];
  const statusColor = TASK_STATUS_COLORS[task?.status] || '';

  const TABS = [
    { id: 'overview',  label: 'Overview',   icon: TrendingUp    },
    { id: 'updates',   label: 'Updates',    icon: Activity      },
    { id: 'comments',  label: 'Comments',   icon: MessageSquare },
    { id: 'media',     label: 'Media',      icon: ImageIcon     },
    { id: 'subtasks',  label: 'Subtasks',   icon: Layers        },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ minHeight: heroImage ? 260 : 180 }}>
        {heroImage ? (
          <>
            <img src={heroImage} alt={task?.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-50 dark:to-gray-900" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/80 mb-4">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <ChevronRight className="h-3 w-3" />
            {task?.projectId && <Link to={`/projects/${task.projectId}`} className="hover:text-white">{task.projectName || 'Project'}</Link>}
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{task?.code}</span>
          </div>

          <div className="flex items-start justify-between gap-4 pb-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow">{task?.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm ${statusColor}`}>
                  {TASK_STATUS_LABELS[task?.status] || task?.status}
                </span>
                {task?.priority && (
                  <span className="text-sm px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
                    Priority {task.priority === 4 ? '🔴 Critical' : task.priority === 3 ? '🟠 High' : task.priority === 2 ? '🔵 Medium' : '⚪ Low'}
                  </span>
                )}
                {task?.contractorName && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/80 text-white flex items-center gap-1">
                    <HardHat className="h-3 w-3" /> {task.contractorName}
                  </span>
                )}
                {task?.milestoneName && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/80 text-white flex items-center gap-1">
                    <Flag className="h-3 w-3" /> {task.milestoneName}
                  </span>
                )}
              </div>
            </div>
            <Button
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 flex-shrink-0"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" /> Edit
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto border-b border-white/20">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white/90'
                  }`}>
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <Card>
                  <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{task?.description || 'No description.'}</p>
                  </CardContent>
                </Card>

                {task?.progress != null && (
                  <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Progress</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{task.progress}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* UPDATES TAB */}
            {activeTab === 'updates' && <UpdatesTab taskId={taskId} task={task} />}

            {/* COMMENTS TAB */}
            {activeTab === 'comments' && <CommentsTab taskId={taskId} />}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <>
                {/* Images */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Images</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()} disabled={uploadingMedia}>
                        <Upload className="h-4 w-4 mr-1" /> {uploadingMedia ? 'Uploading…' : 'Upload'}
                      </Button>
                      <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f, 'image'); }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.imageUrls?.length ? <MediaGallery items={task.imageUrls} columns={3} /> : <p className="text-center py-8 text-gray-400 text-sm">No images</p>}
                  </CardContent>
                </Card>

                {/* Videos */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2"><Video className="h-5 w-5" /> Videos</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} disabled={uploadingMedia}>
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </Button>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f, 'video'); }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.videoUrls?.length
                      ? <div className="grid grid-cols-2 gap-3">{task.videoUrls.map((url, i) => <video key={i} src={url} controls className="w-full rounded-lg" />)}</div>
                      : <p className="text-center py-8 text-gray-400 text-sm">No videos</p>}
                  </CardContent>
                </Card>

                {/* Audio */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2"><Mic className="h-5 w-5" /> Audio Notes</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => audioInputRef.current?.click()} disabled={uploadingMedia}>
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </Button>
                      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f, 'audio'); }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.audioUrls?.length
                      ? <div className="space-y-2">{task.audioUrls.map((url, i) => <audio key={i} src={url} controls className="w-full" />)}</div>
                      : <p className="text-center py-8 text-gray-400 text-sm">No audio notes</p>}
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2"><Paperclip className="h-5 w-5" /> Documents</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => docInputRef.current?.click()} disabled={uploadingMedia}>
                        <Upload className="h-4 w-4 mr-1" /> Upload
                      </Button>
                      <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f, 'document'); }} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {task?.attachmentUrls?.length
                      ? <div className="space-y-2">{task.attachmentUrls.map((url, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-gray-400" /><span className="text-sm">Document {i + 1}</span></div>
                            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">Download</a>
                          </div>
                        ))}</div>
                      : <p className="text-center py-8 text-gray-400 text-sm">No attachments</p>}
                  </CardContent>
                </Card>
              </>
            )}

            {/* SUBTASKS TAB */}
            {activeTab === 'subtasks' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Subtasks ({subtasks.length})</CardTitle>
                    <Button size="sm" onClick={() => setIsSubtaskModalOpen(true)} className="gap-1"><Plus className="h-3 w-3" /> Add</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {subtasks.length > 0 ? (
                    <div className="space-y-2">
                      {subtasks.map(st => (
                        <Link key={st.id} to={`/tasks/${st.id}`}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-primary-600">{st.title}</p>
                            {st.description && <p className="text-xs text-gray-500 line-clamp-1">{st.description}</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${TASK_STATUS_COLORS[st.status] || ''}`}>{TASK_STATUS_LABELS[st.status] || st.status}</span>
                            <span className="text-xs font-medium text-gray-500">{st.progress}%</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Layers className="h-10 w-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 text-sm mb-3">No subtasks yet</p>
                      <Button size="sm" variant="outline" onClick={() => setIsSubtaskModalOpen(true)}>Create First Subtask</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Task Details */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Task Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                {task?.projectName && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Folder className="h-3 w-3" /> Project</p>
                    <Link to={`/projects/${task.projectId}`} className="font-medium text-primary-600 hover:underline">{task.projectName}</Link>
                  </div>
                )}
                {task?.departmentName && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Layers className="h-3 w-3" /> Department</p>
                    <p className="font-medium text-gray-900 dark:text-white">{task.departmentName}</p>
                  </div>
                )}
                {task?.contractorName && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><HardHat className="h-3 w-3" /> Contractor</p>
                    <p className="font-medium text-gray-900 dark:text-white">{task.contractorName}</p>
                  </div>
                )}
                {task?.milestoneName && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Flag className="h-3 w-3" /> Milestone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{task.milestoneName}</p>
                  </div>
                )}
                {task?.assignees && task.assignees.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><Users className="h-3 w-3" /> Assignees</p>
                    <div className="space-y-1.5">
                      {task.assignees.map(a => {
                        const initials = a.userName
                          ? a.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                          : '?';
                        return (
                          <div key={a.userId} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {initials}
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.userName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {task?.startDate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatShort(task.startDate)}</p>
                  </div>
                )}
                {task?.dueDate && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Due Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatShort(task.dueDate)}</p>
                  </div>
                )}
                {task?.estimatedHours && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Estimated Hours</p>
                    <p className="font-medium text-gray-900 dark:text-white">{task.estimatedHours}h</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Submit Update */}
            <Card>
              <CardContent className="pt-4 pb-4">
                <Button
                  className="w-full gap-1"
                  onClick={() => navigate(`/tasks/${taskId}/submit`)}
                >
                  <Send className="h-4 w-4" /> Submit Progress Update
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300">{error}</div>
        )}
      </div>

      {/* Modals */}
      <TaskFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} taskToEdit={task} onSuccess={fetchTaskDetails} />
      <TaskFormModal isOpen={isSubtaskModalOpen} onClose={() => setIsSubtaskModalOpen(false)} parentTask={task} onSuccess={fetchTaskDetails} />
    </div>
  );
}
