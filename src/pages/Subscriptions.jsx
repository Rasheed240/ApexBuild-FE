import { useState, useEffect } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useOrganizations } from '../contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import {
  CreditCard,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Trash2,
  Eye,
  Mail,
  Clock,
  Zap,
} from 'lucide-react';

export const SubscriptionsPage = () => {
  const {
    subscription,
    licenses,
    usersWithLicenses,
    stats,
    loading,
    error,
    loadSubscription,
    createSubscription,
    upgradeSubscription,
    downgradeSubscription,
    reactivateSubscription,
    cancelSubscription,
    assignLicense,
    revokeLicense,
    getPaymentHistory,
  } = useSubscriptions();

  const { selectedOrganization } = useOrganizations();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null); // upgrade | downgrade | cancel | reactivate
  const [formData, setFormData] = useState({
    numberOfLicenses: 10,
    trialDays: 14,
    additionalLicenses: 0,
    licensesToRemove: 0,
    reason: '',
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (selectedOrganization?.id) {
      loadSubscription(selectedOrganization.id);
    }
  }, [selectedOrganization, loadSubscription]);

  const clearMessages = () => {
    setSuccessMessage('');
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const result = await createSubscription({
      numberOfLicenses: parseInt(formData.numberOfLicenses),
      trialDays: parseInt(formData.trialDays),
    });

    if (result.success) {
      setSuccessMessage('Subscription created successfully!');
      setShowCreateForm(false);
      setFormData({ numberOfLicenses: 10, trialDays: 14 });
      clearMessages();
    }

    setSubmitting(false);
  };

  const handleUpgradeSubscription = async () => {
    setSubmitting(true);

    const result = await upgradeSubscription(
      subscription.id,
      parseInt(formData.additionalLicenses)
    );

    if (result.success) {
      setSuccessMessage('Subscription upgraded successfully!');
      setShowActionModal(false);
      setFormData({ ...formData, additionalLicenses: 0 });
      setTimeout(clearMessages, 3000);
    }

    setSubmitting(false);
  };

  const handleDowngradeSubscription = async () => {
    setSubmitting(true);

    const result = await downgradeSubscription(
      subscription.id,
      parseInt(formData.licensesToRemove)
    );

    if (result.success) {
      setSuccessMessage('Subscription downgraded successfully!');
      setShowActionModal(false);
      setFormData({ ...formData, licensesToRemove: 0 });
      setTimeout(clearMessages, 3000);
    }

    setSubmitting(false);
  };

  const handleReactivateSubscription = async () => {
    setSubmitting(true);

    const result = await reactivateSubscription(subscription.id);

    if (result.success) {
      setSuccessMessage('Subscription reactivated successfully!');
      setShowActionModal(false);
      setTimeout(clearMessages, 3000);
    }

    setSubmitting(false);
  };

  const handleCancelSubscription = async () => {
    setSubmitting(true);

    const result = await cancelSubscription(subscription.id, formData.reason);

    if (result.success) {
      setSuccessMessage('Subscription cancelled successfully!');
      setShowActionModal(false);
      setFormData({ ...formData, reason: '' });
      setTimeout(clearMessages, 3000);
    }

    setSubmitting(false);
  };

  const loadPaymentHistory = async () => {
    const history = await getPaymentHistory();
    setPaymentHistory(history);
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-orange-100 text-orange-800',
      Cancelled: 'bg-red-100 text-red-800',
      Expired: 'bg-red-100 text-red-800',
      PendingPayment: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    if (status === 'Active') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'Cancelled' || status === 'Expired') return <XCircle className="w-4 h-4" />;
    if (status === 'PendingPayment') return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (!selectedOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <Alert className="max-w-md" variant="info">
          Please select an organization to manage subscriptions
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage billing, licenses, and users for {selectedOrganization.name}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert variant="error">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('licenses')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'licenses'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Licenses ({licenses.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('users');
            // Auto-load users when tab is clicked
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Users with Licenses ({usersWithLicenses.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('payments');
            loadPaymentHistory();
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Payments
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  Create a subscription to start managing licenses for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Subscription
                </button>

                {showCreateForm && (
                  <form onSubmit={handleCreateSubscription} className="mt-6 space-y-4 border-t pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Number of Licenses
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.numberOfLicenses}
                        onChange={(e) =>
                          setFormData({ ...formData, numberOfLicenses: e.target.value })
                        }
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">$10 per license per month</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Trial Period (Days)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        value={formData.trialDays}
                        onChange={(e) =>
                          setFormData({ ...formData, trialDays: e.target.value })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">Recommended: 14 days</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {submitting ? 'Creating...' : 'Create Subscription'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Subscription Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(subscription.status)}
                        Subscription Status
                      </CardTitle>
                      <CardDescription>Current billing and license information</CardDescription>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(
                        subscription.status
                      )}`}
                    >
                      {subscription.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Licenses</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {subscription.numberOfLicenses}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Licenses Used</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {subscription.licensesUsed}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                      <p className="text-2xl font-bold text-green-600">
                        {subscription.numberOfLicenses - subscription.licensesUsed}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Cost</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${subscription.amount}
                      </p>
                    </div>
                  </div>

                  {/* Trial Status */}
                  {subscription.isTrialPeriod && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            Trial Period Active
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                            Trial ends on{' '}
                            {new Date(subscription.trialEndDate).toLocaleDateString()}
                            {' '}
                            ({Math.max(0, Math.ceil((new Date(subscription.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24)))} days remaining)
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                            Billing will begin automatically after trial expires
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Billing Dates */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Billing Start
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {new Date(subscription.billingStartDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Billing End
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {new Date(subscription.billingEndDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Auto-Renew Status */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-Renewal
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subscription.autoRenew
                          ? 'Enabled - Will renew automatically'
                          : 'Disabled - Manual renewal required'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        subscription.autoRenew
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subscription.autoRenew ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => {
                        setActionType('upgrade');
                        setShowActionModal(true);
                      }}
                      className="p-2 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-green-600 mb-2" />
                      <p className="text-sm font-medium">Upgrade</p>
                      <p className="text-xs text-gray-600">Add licenses</p>
                    </button>

                    <button
                      onClick={() => {
                        setActionType('downgrade');
                        setShowActionModal(true);
                      }}
                      className="p-2 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-orange-600 mb-2" />
                      <p className="text-sm font-medium">Downgrade</p>
                      <p className="text-xs text-gray-600">Remove licenses</p>
                    </button>

                    {subscription.status === 'Cancelled' && (
                      <button
                        onClick={() => {
                          setActionType('reactivate');
                          setShowActionModal(true);
                        }}
                        className="p-2 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <RotateCcw className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-sm font-medium">Reactivate</p>
                        <p className="text-xs text-gray-600">Resume billing</p>
                      </button>
                    )}

                    {subscription.status !== 'Cancelled' && (
                      <button
                        onClick={() => {
                          setActionType('cancel');
                          setShowActionModal(true);
                        }}
                        className="p-2 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <XCircle className="w-5 h-5 text-red-600 mb-2" />
                        <p className="text-sm font-medium">Cancel</p>
                        <p className="text-xs text-gray-600">Stop subscription</p>
                      </button>
                    )}

                    <button
                      onClick={() => loadSubscription()}
                      className="p-2 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 text-gray-600 mb-2" />
                      <p className="text-sm font-medium">Refresh</p>
                      <p className="text-xs text-gray-600">Sync data</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Action Modal */}
              {showActionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>
                        {actionType === 'upgrade' && 'Upgrade Subscription'}
                        {actionType === 'downgrade' && 'Downgrade Subscription'}
                        {actionType === 'reactivate' && 'Reactivate Subscription'}
                        {actionType === 'cancel' && 'Cancel Subscription'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {actionType === 'upgrade' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Additional Licenses
                            </label>
                            <Input
                              type="number"
                              min="1"
                              value={formData.additionalLicenses}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  additionalLicenses: e.target.value,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Cost: $
                              {(parseInt(formData.additionalLicenses) || 0) * 10}/month
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleUpgradeSubscription}
                              disabled={submitting || !formData.additionalLicenses}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {submitting ? 'Upgrading...' : 'Confirm Upgrade'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowActionModal(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}

                      {actionType === 'downgrade' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Licenses to Remove
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max={subscription.numberOfLicenses - 1}
                              value={formData.licensesToRemove}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  licensesToRemove: e.target.value,
                                })
                              }
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              New total: {subscription.numberOfLicenses - (parseInt(formData.licensesToRemove) || 0)} licenses
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleDowngradeSubscription}
                              disabled={submitting || !formData.licensesToRemove}
                              className="flex-1 bg-orange-600 hover:bg-orange-700"
                            >
                              {submitting ? 'Downgrading...' : 'Confirm Downgrade'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowActionModal(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}

                      {actionType === 'reactivate' && (
                        <>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Reactivate your subscription and resume billing?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleReactivateSubscription}
                              disabled={submitting}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              {submitting ? 'Reactivating...' : 'Confirm Reactivation'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowActionModal(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}

                      {actionType === 'cancel' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Reason (Optional)
                            </label>
                            <textarea
                              value={formData.reason}
                              onChange={(e) =>
                                setFormData({ ...formData, reason: e.target.value })
                              }
                              placeholder="Why are you cancelling?"
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <Alert variant="warning">
                            Cancelling will revoke all active licenses in 24 hours
                          </Alert>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleCancelSubscription}
                              disabled={submitting}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                              {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowActionModal(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Licenses Tab */}
      {activeTab === 'licenses' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Active Licenses
            </CardTitle>
            <CardDescription>
              {licenses.length} license{licenses.length !== 1 ? 's' : ''} assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {licenses.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No licenses assigned yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        User
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        License Key
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Valid Until
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Days Left
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license) => (
                      <tr key={license.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-2 px-3 text-gray-900 dark:text-white">{license.user?.fullName}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400 font-mono text-sm">
                          {license.licenseKey}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(
                              license.status
                            )}`}
                          >
                            {getStatusIcon(license.status)}
                            {license.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {new Date(license.validUntil).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3">
                          <span className={license.daysUntilExpiration < 7 ? 'text-red-600 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                            {license.daysUntilExpiration}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => revokeLicense(license.id, 'Revoked by admin')}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                            disabled={submitting}
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users with Licenses Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users with Active Licenses
            </CardTitle>
            <CardDescription>
              {usersWithLicenses.length} user{usersWithLicenses.length !== 1 ? 's' : ''} with licenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersWithLicenses.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No users have licenses yet</p>
            ) : (
              <div className="space-y-3">
                {usersWithLicenses.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                            {user.fullName?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.email}
                          </p>
                          {user.license && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                {user.license.status}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                Expires: {new Date(user.license.validUntil).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => revokeLicense(user.license?.id, 'Revoked')}
                        disabled={submitting}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No payment history</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Date
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">
                        Stripe Charge ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                          ${payment.amount}
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                          {payment.paymentType}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400 font-mono text-sm">
                          {payment.stripeChargeId || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
};
