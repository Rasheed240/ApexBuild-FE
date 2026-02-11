import { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useOrganizations } from '../contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  CreditCard, Users, Calendar, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, RotateCcw, Loader, DollarSign, Clock, Zap,
} from 'lucide-react';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const STATUS_META = {
  Active:   { color: 'text-green-600  dark:text-green-400',  bg: 'bg-green-50   dark:bg-green-900/20',  label: 'Active'   },
  Trial:    { color: 'text-blue-600   dark:text-blue-400',   bg: 'bg-blue-50    dark:bg-blue-900/20',   label: 'Trial'    },
  Expired:  { color: 'text-red-600    dark:text-red-400',    bg: 'bg-red-50     dark:bg-red-900/20',    label: 'Expired'  },
  Cancelled:{ color: 'text-gray-600   dark:text-gray-400',   bg: 'bg-gray-50    dark:bg-gray-700',      label: 'Cancelled'},
  Suspended:{ color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50  dark:bg-orange-900/20', label: 'Suspended'},
};

function StatCard({ label, value, icon: Icon, color = 'text-primary-600', bg = 'bg-primary-50 dark:bg-primary-900/20' }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`${bg} rounded-xl p-3`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const SubscriptionsPage = () => {
  const {
    subscription, stats, seatUsage, loading, error,
    loadSubscription, createSubscription, renewSubscription,
    reactivateSubscription, cancelSubscription, getPaymentHistory,
  } = useSubscriptions();

  const { selectedOrganization } = useOrganizations();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [actionLoading,  setActionLoading]  = useState(null);
  const [cancelReason,   setCancelReason]   = useState('');
  const [showCancel,     setShowCancel]     = useState(false);
  const [message,        setMessage]        = useState('');
  const [msgType,        setMsgType]        = useState('success');

  useEffect(() => {
    if (selectedOrganization?.id) {
      loadSubscription(selectedOrganization.id);
    }
  }, [selectedOrganization?.id]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await getPaymentHistory();
      setPaymentHistory(Array.isArray(data) ? data : []);
    } catch { setPaymentHistory([]); }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'billing') fetchHistory();
  }, [activeTab]);

  const notify = (msg, type = 'success') => {
    setMessage(msg); setMsgType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleRenew = async () => {
    if (!subscription?.id) return;
    setActionLoading('renew');
    const { success, error: err } = await renewSubscription(subscription.id);
    setActionLoading(null);
    if (success) notify('Subscription renewed successfully!');
    else notify(err || 'Renewal failed', 'error');
  };

  const handleReactivate = async () => {
    if (!subscription?.id) return;
    setActionLoading('reactivate');
    const { success, error: err } = await reactivateSubscription(subscription.id);
    setActionLoading(null);
    if (success) notify('Subscription reactivated!');
    else notify(err || 'Reactivation failed', 'error');
  };

  const handleCancel = async () => {
    if (!subscription?.id) return;
    setActionLoading('cancel');
    const { success, error: err } = await cancelSubscription(subscription.id, cancelReason);
    setActionLoading(null);
    setShowCancel(false);
    if (success) notify('Subscription cancelled');
    else notify(err || 'Cancellation failed', 'error');
  };

  const handleCreateTrial = async () => {
    setActionLoading('create');
    const { success, error: err } = await createSubscription({ isFreePlan: false, trialDays: 30 });
    setActionLoading(null);
    if (success) notify('Trial subscription created! 30 days free.');
    else notify(err || 'Failed to create subscription', 'error');
  };

  const statusMeta = STATUS_META[subscription?.status] || STATUS_META.Active;
  const monthlyEstimate = seatUsage ? (seatUsage.activeSeats * (seatUsage.userMonthlyRate ?? 20)) : null;
  const daysLeft = subscription?.billingEndDate
    ? Math.ceil((new Date(subscription.billingEndDate) - new Date()) / 86400000)
    : null;

  const TABS = [
    { id: 'overview', label: 'Overview'       },
    { id: 'billing',  label: 'Billing History' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="h-7 w-7 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary-600" /> Subscription & Billing
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {selectedOrganization?.name || 'Organization'} · $20 / active user / month
          </p>
        </div>

        {/* Status message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${msgType === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'}`}>
            {msgType === 'success' ? <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 flex gap-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === t.id ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            {/* No subscription */}
            {!subscription ? (
              <Card>
                <CardContent className="py-14 text-center">
                  <CreditCard className="h-14 w-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No subscription yet</h3>
                  <p className="text-sm text-gray-500 mb-6">Start a 30-day free trial — no credit card required.</p>
                  <Button onClick={handleCreateTrial} disabled={actionLoading === 'create'} className="gap-1">
                    {actionLoading === 'create' ? <Loader className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Start 30-Day Trial
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Status Banner */}
                <div className={`${statusMeta.bg} border ${statusMeta.color.replace('text-', 'border-').replace(' dark:text-', ' dark:border-').replace(/dark:\w+/, '')} rounded-xl p-5`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Subscription Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${statusMeta.color}`}>{statusMeta.label}</span>
                        {subscription.isFreePlan && <span className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full font-medium text-gray-600">Free Plan</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Billing Period Ends</p>
                      <p className={`font-semibold ${daysLeft !== null && daysLeft <= 7 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
                        {formatDate(subscription.billingEndDate)}
                        {daysLeft !== null && ` (${daysLeft}d)`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Active Seats"
                    value={seatUsage?.activeSeats ?? subscription.activeUserCount ?? 0}
                    icon={Users}
                    color="text-indigo-600"
                    bg="bg-indigo-50 dark:bg-indigo-900/20"
                  />
                  <StatCard
                    label="Rate / User"
                    value={`$${seatUsage?.userMonthlyRate ?? subscription.userMonthlyRate ?? 20}/mo`}
                    icon={DollarSign}
                    color="text-primary-600"
                  />
                  <StatCard
                    label="Est. Monthly"
                    value={`$${monthlyEstimate ?? (subscription.amount ?? 0)}`}
                    icon={CreditCard}
                    color="text-green-600"
                    bg="bg-green-50 dark:bg-green-900/20"
                  />
                  <StatCard
                    label="Days Left"
                    value={daysLeft ?? '—'}
                    icon={Clock}
                    color={daysLeft !== null && daysLeft <= 7 ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}
                    bg={daysLeft !== null && daysLeft <= 7 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-gray-100 dark:bg-gray-700'}
                  />
                </div>

                {/* Billing Details */}
                <Card>
                  <CardHeader><CardTitle>Billing Details</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Billing Cycle</p>
                      <p className="font-medium text-gray-900 dark:text-white">{subscription.billingCycle || 'Monthly'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Auto Renew</p>
                      <p className="font-medium text-gray-900 dark:text-white">{subscription.autoRenew ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Billing Start</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.billingStartDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Next Billing</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.nextBillingDate)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    {(subscription.status === 'Active' || subscription.status === 'Trial') && (
                      <Button variant="outline" onClick={handleRenew} disabled={!!actionLoading} className="gap-1">
                        {actionLoading === 'renew' ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Renew Now
                      </Button>
                    )}
                    {(subscription.status === 'Cancelled' || subscription.status === 'Expired' || subscription.status === 'Suspended') && (
                      <Button onClick={handleReactivate} disabled={!!actionLoading} className="gap-1">
                        {actionLoading === 'reactivate' ? <Loader className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        Reactivate
                      </Button>
                    )}
                    {subscription.status !== 'Cancelled' && (
                      <Button variant="outline" className="gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setShowCancel(true)} disabled={!!actionLoading}>
                        <XCircle className="h-4 w-4" /> Cancel Subscription
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Cancel confirmation */}
                {showCancel && (
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-5">
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Confirm Cancellation
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Your subscription will remain active until {formatDate(subscription.billingEndDate)}.</p>
                      <textarea
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="Reason for cancellation (optional)"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
                      />
                      <div className="flex gap-3">
                        <Button size="sm" variant="outline" onClick={() => setShowCancel(false)}>Keep Subscription</Button>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1"
                          onClick={handleCancel} disabled={actionLoading === 'cancel'}>
                          {actionLoading === 'cancel' ? <Loader className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          Yes, Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* ─── BILLING HISTORY ───────────────────────────────────────── */}
        {activeTab === 'billing' && (
          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="py-8 flex justify-center"><Loader className="h-6 w-6 animate-spin text-primary-600" /></div>
              ) : paymentHistory.length === 0 ? (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No payment records yet
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {paymentHistory.map((p, i) => (
                    <div key={p.id || i} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{p.description || 'Subscription Payment'}</p>
                        <p className="text-xs text-gray-500">{formatDate(p.paidAt || p.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">${p.amount}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'Paid' || p.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                          {p.status || 'Paid'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
