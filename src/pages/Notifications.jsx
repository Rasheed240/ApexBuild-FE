import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import {
  Bell,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  Trash2,
} from 'lucide-react';

const typeLabels = {
  TaskUpdate: 'Task Update',
  Reminder: 'Reminder',
  Alert: 'Alert',
  Announcement: 'Announcement',
};

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 20, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ isRead: null, type: null });
  const [busy, setBusy] = useState(false);

  const loadNotifications = async (pageNumber = 1, options = filter) => {
    try {
      setLoading(true);
      setError('');
      const data = await notificationService.list({ pageNumber, pageSize: pagination.pageSize, ...options });
      setNotifications(data?.notifications ?? data?.Notifications ?? []);
      setPagination({
        pageNumber,
        pageSize: data?.pageSize ?? pagination.pageSize,
        totalCount: data?.totalCount ?? data?.TotalCount ?? 0,
      });
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    loadNotifications(1, nextFilter);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      setBusy(true);
      await notificationService.markAsRead(notificationId);
      await loadNotifications(pagination.pageNumber);
    } catch (err) {
      setError('Failed to mark notification as read.');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setBusy(true);
      await notificationService.markAllAsRead();
      await loadNotifications(pagination.pageNumber);
    } catch (err) {
      setError('Failed to mark notifications as read.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      setBusy(true);
      await notificationService.delete(notificationId);
      await loadNotifications(pagination.pageNumber);
    } catch (err) {
      setError('Failed to delete notification.');
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="mt-2 text-gray-600">Stay on top of updates across your workspace.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleFilterChange({ isRead: false, type: null })}
          >
            <Filter className="mr-2 h-4 w-4" />
            Unread only
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleFilterChange({ isRead: null, type: null })}
          >
            Clear filters
          </Button>
          <Button onClick={handleMarkAllAsRead} disabled={busy}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 py-4 ${
                    notification.isRead ? 'bg-white' : 'bg-primary-50/60'
                  } px-4 rounded-lg`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{notification.title}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          notification.isRead
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-primary-100 text-primary-700'
                        }`}
                      >
                        {notification.isRead ? 'Read' : 'New'}
                      </span>
                      {notification.type && (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                          {typeLabels[notification.type] ?? notification.type}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(notification.createdAt)}
                      </div>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs"
                        >
                          <Mail className="h-3 w-3" />
                          View details
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={busy}
                      >
                        Mark read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(notification.id)}
                      disabled={busy}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

