import { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';

/**
 * Proration Preview Component
 * Shows cost breakdown for subscription changes with timeline
 */
export const ProrationPreview = ({
    subscriptionId,
    currentQuantity,
    newQuantity,
    currentPrice,
    className = '',
}) => {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (subscriptionId && newQuantity && newQuantity !== currentQuantity) {
            loadPreview();
        }
    }, [subscriptionId, newQuantity]);

    const loadPreview = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await invoiceService.previewProration(subscriptionId, newQuantity);
            setPreview(data);
        } catch (err) {
            setError('Failed to load proration preview');
        } finally {
            setLoading(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const isUpgrade = newQuantity > currentQuantity;
    const changeAmount = Math.abs(newQuantity - currentQuantity);

    if (loading) {
        return (
            <Card className={`p-4 ${className}`}>
                <LoadingSpinner size="sm" text="Calculating..." />
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`p-4 border-red-200 dark:border-red-800 ${className}`}>
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            </Card>
        );
    }

    if (!preview) return null;

    return (
        <Card className={`p-4 ${className}`}>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                    {isUpgrade ? (
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    ) : (
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <TrendingDown className="w-5 h-5 text-blue-600" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                            {isUpgrade ? 'Upgrade' : 'Downgrade'} Preview
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {isUpgrade ? 'Adding' : 'Removing'} {changeAmount} license
                            {changeAmount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Timeline Bar */}
                <div className="relative">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${isUpgrade ? 'bg-green-500' : 'bg-blue-500'
                                } transition-all duration-500`}
                            style={{
                                width: `${((preview.currentPeriodElapsed || 15) / (preview.billingPeriodDays || 30)) * 100
                                    }%`,
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Period start</span>
                        <span className="font-medium">Today</span>
                        <span>Period end</span>
                    </div>
                </div>

                {/* Change Summary */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Current plan</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {currentQuantity} licenses × {formatAmount(currentPrice || 10)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">New plan</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {newQuantity} licenses × {formatAmount(currentPrice || 10)}
                        </span>
                    </div>
                </div>

                {/* Proration Details */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <DollarSign className="w-4 h-4" />
                            <span>{isUpgrade ? 'Prorated charge today' : 'Credit applied'}</span>
                        </div>
                        <span
                            className={`font-semibold ${isUpgrade ? 'text-orange-600' : 'text-green-600'
                                }`}
                        >
                            {isUpgrade ? '' : '-'}
                            {formatAmount(preview.proratedAmount || 0)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isUpgrade
                            ? `Based on ${preview.daysRemaining || 15} days remaining in billing period`
                            : 'Credit will be applied to your next invoice'}
                    </p>
                </div>

                {/* Next Invoice */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>Next invoice ({preview.nextBillingDate || 'Dec 31'})</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatAmount(preview.nextInvoiceAmount || newQuantity * (currentPrice || 10))}
                        </span>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                        {isUpgrade
                            ? 'Your card will be charged the prorated amount immediately. The full new amount will be charged on your next billing date.'
                            : 'No charge today. The credit will reduce your next invoice. Your subscription remains active until the end of the current period.'}
                    </p>
                </div>
            </div>
        </Card>
    );
};
