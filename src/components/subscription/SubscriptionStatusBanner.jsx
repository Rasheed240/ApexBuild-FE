import { Alert } from '../ui/Alert';
import {
    AlertTriangle,
    Zap,
    XCircle,
    Clock,
    CreditCard,
    CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * Subscription Status Banner Component
 * Context-aware banners based on subscription status
 */
export const SubscriptionStatusBanner = ({
    subscription,
    onAction,
    onAddPaymentMethod,
}) => {
    if (!subscription) return null;

    const { status, isTrialPeriod, trialEndDate, cancelledAt, stripeCurrentPeriodEnd } =
        subscription;

    // Past Due - Payment Failed
    if (status === 'PendingPayment' || status === 'past_due') {
        return (
            <Alert variant="warning" className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                Payment Failed
                            </p>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                We couldn't process your payment. Update your payment method to avoid service
                                interruption.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={onAddPaymentMethod}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white flex-shrink-0"
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Update Payment
                    </Button>
                </div>
            </Alert>
        );
    }

    // Trial Period Active
    if (isTrialPeriod) {
        const daysRemaining = Math.max(
            0,
            Math.ceil((new Date(trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))
        );

        return (
            <Alert variant="info" className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                                Trial Period Active
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                {daysRemaining} days remaining in your trial. Add a payment method to continue
                                after {new Date(trialEndDate).toLocaleDateString()}.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={onAddPaymentMethod}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                    >
                        Add Card
                    </Button>
                </div>
            </Alert>
        );
    }

    // Cancelled - Ending Soon
    if (status === 'Cancelled' && stripeCurrentPeriodEnd) {
        const daysUntilEnd = Math.max(
            0,
            Math.ceil((new Date(stripeCurrentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
        );

        return (
            <Alert variant="error" className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-red-900 dark:text-red-100">
                                Subscription Ending
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                Your subscription ends on {new Date(stripeCurrentPeriodEnd).toLocaleDateString()}
                                {daysUntilEnd > 0 && ` (${daysUntilEnd} days remaining)`}. Reactivate now to continue service.
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => onAction?.('reactivate')}
                        className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                    >
                        Reactivate
                    </Button>
                </div>
            </Alert>
        );
    }

    // Incomplete - Awaiting Payment Setup
    if (status === 'Incomplete') {
        return (
            <Alert variant="warning" className="mb-6">
                <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                            Payment Setup Required
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                            Complete your payment setup to activate your subscription.
                        </p>
                    </div>
                </div>
            </Alert>
        );
    }

    // Active - All Good (optional success banner)
    if (status === 'Active' && !isTrialPeriod) {
        return (
            <Alert variant="success" className="mb-6">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-green-900 dark:text-green-100">
                            Subscription Active
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                            Your subscription is active and billing automatically.
                        </p>
                    </div>
                </div>
            </Alert>
        );
    }

    return null;
};
