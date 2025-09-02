import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { CardBrandIcon, CardBrandText } from '../ui/CardBrandIcon';
import { StripeSetupModal } from './StripeSetupModal';
import { stripeService } from '../../services/stripeService';
import {
    CreditCard,
    Plus,
    Trash2,
    Star,
    Check,
    AlertTriangle,
    Loader2,
} from 'lucide-react';

/**
 * Payment Methods Card Component
 * Manages payment methods for subscription billing
 */
export const PaymentMethodsCard = ({ organizationId, customerId }) => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (organizationId) {
            loadPaymentMethods();
        }
    }, [organizationId]);

    const loadPaymentMethods = async () => {
        setLoading(true);
        setError(null);

        try {
            const methods = await stripeService.getPaymentMethods(organizationId);
            setPaymentMethods(methods || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payment methods');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (paymentMethodId) => {
        setActionLoading(paymentMethodId);

        try {
            await stripeService.setDefaultPaymentMethod(paymentMethodId);
            await loadPaymentMethods(); // Reload to get updated status
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set default payment method');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (paymentMethodId) => {
        if (!confirm('Are you sure you want to remove this payment method?')) {
            return;
        }

        setActionLoading(paymentMethodId);

        try {
            await stripeService.deletePaymentMethod(paymentMethodId);
            await loadPaymentMethods();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete payment method');
        } finally {
            setActionLoading(null);
        }
    };

    const isExpiringSoon = (expMonth, expYear) => {
        const today = new Date();
        const expiryDate = new Date(expYear, expMonth - 1);
        const monthsUntilExpiry = (expiryDate - today) / (1000 * 60 * 60 * 24 * 30);
        return monthsUntilExpiry <= 2 && monthsUntilExpiry > 0;
    };

    const isExpired = (expMonth, expYear) => {
        const today = new Date();
        const expiryDate = new Date(expYear, expMonth - 1);
        return expiryDate < today;
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Payment Methods
                            </CardTitle>
                            <CardDescription>
                                Manage cards and payment methods for your subscription
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowSetupModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={!customerId}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Card
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : paymentMethods.length === 0 ? (
                        <div className="text-center py-12">
                            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                No payment methods added yet
                            </p>
                            <Button
                                onClick={() => setShowSetupModal(true)}
                                variant="outline"
                                disabled={!customerId}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Card
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className="group relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Card Icon */}
                                        <CardBrandIcon brand={method.card?.brand} className="flex-shrink-0" />

                                        {/* Card Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    <CardBrandText brand={method.card?.brand} />
                                                </p>
                                                {method.isDefault && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        Default
                                                    </span>
                                                )}
                                                {isExpired(method.card?.exp_month, method.card?.exp_year) && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                                        Expired
                                                    </span>
                                                )}
                                                {isExpiringSoon(method.card?.exp_month, method.card?.exp_year) && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Expiring Soon
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                •••• •••• •••• {method.card?.last4}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Expires {method.card?.exp_month?.toString().padStart(2, '0')}/
                                                {method.card?.exp_year}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {!method.isDefault && (
                                                <Button
                                                    onClick={() => handleSetDefault(method.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={actionLoading === method.id}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {actionLoading === method.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 mr-1" />
                                                            Set Default
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => handleDelete(method.id)}
                                                variant="ghost"
                                                size="sm"
                                                disabled={actionLoading === method.id || method.isDefault}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {actionLoading === method.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Helper Text */}
                    {paymentMethods.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                <Star className="w-3 h-3 inline mr-1" />
                                Your default payment method will be charged for subscription renewal
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Setup Modal */}
            <StripeSetupModal
                isOpen={showSetupModal}
                onClose={() => {
                    setShowSetupModal(false);
                    loadPaymentMethods(); // Reload after adding
                }}
                customerId={customerId}
            />
        </>
    );
};
